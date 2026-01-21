import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { PaypalOAuthCallbackDto } from './dto/paypal-oauth-callback.dto';
import { PaypalManualConnectDto } from './dto/paypal-manual-connect.dto';
import { paypalConfig, PaypalConfig } from './paypal.config';

export interface PaypalOAuthStatePayload {
  state: string;
  redirectUri: string;
  authorizeUrl: string;
  expiresAt: string;
  scope: string[];
}

export interface PaypalOAuthCallbackResult {
  message: string;
  connection: {
    userId: string;
    expiresAt: string | null;
    hasRefreshToken: boolean;
    scope?: string;
    email?: string | null;
  };
}

export interface PaypalOAuthTokens {
  scope?: string;
  access_token: string;
  token_type?: string;
  app_id?: string;
  expires_in?: number;
  nonce?: string;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  id_token?: string;
  payer_id?: string;
}

export interface PaypalOAuthTokenResponse {
  accessToken: string;
  expiresAt: string | null;
  tokenType: string | null;
  scope: string | null;
  refreshed: boolean;
}

export interface PaypalOAuthConnectionStatus {
  connected: boolean;
  email: string | null;
  scope: string | null;
  expiresAt: string | null;
  hasRefreshToken: boolean;
  lastSyncedAt: string | null;
  merchantId: string | null;
  payerId: string | null;
}

interface PaypalUserProfile {
  payerId: string | null;
  merchantId: string | null;
  businessName: string | null;
  email: string | null;
}

@Injectable()
export class PaypalOAuthService {
  private static readonly STATE_TTL_MS = 10 * 60 * 1000; // 10 minutos
  private static readonly ACCESS_TOKEN_EXPIRY_SKEW_MS = 60 * 1000; // 1 minuto

  private readonly logger = new Logger(PaypalOAuthService.name);

  constructor(
    @Inject(paypalConfig.KEY) private readonly config: PaypalConfig,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Inicia o fluxo de autoriza��o gerando um state e a URL de consentimento do PayPal.
   */
  async createAuthorizationIntent(userId: string): Promise<PaypalOAuthStatePayload> {
    const clientId = this.ensureClientId();
    const redirectUri = this.ensureRedirectUri();
    const scopes = this.resolveScopes();
    const state = randomUUID();
    const expiresAt = new Date(Date.now() + PaypalOAuthService.STATE_TTL_MS);

    await this.prisma.paypalOAuthState.create({
      data: {
        state,
        userId,
        redirectUri,
        expiresAt
      }
    });

      const authorizeUrl = this.buildAuthorizeUrl({
        clientId,
        redirectUri,
        state,
        scope: scopes.join(' '),
        nonce: state
      });

    return {
      state,
      redirectUri,
      authorizeUrl,
      expiresAt: expiresAt.toISOString(),
      scope: scopes
    };
  }

  /**
   * Processa o retorno do PayPal, troca o c� digo por tokens e persiste na base.
   */
  async handleCallback(query: PaypalOAuthCallbackDto): Promise<PaypalOAuthCallbackResult> {
    if (query.error) {
      this.logger.warn(`PayPal OAuth retornou erro: ${query.error}`);
      throw new BadRequestException(`Integracao com o PayPal falhou: ${query.error}`);
    }

    if (!query.code) {
      throw new BadRequestException('Codigo de autorizacao ausente na resposta do PayPal.');
    }

    const stateRecord = await this.prisma.paypalOAuthState.findUnique({
      where: { state: query.state }
    });

    if (!stateRecord) {
      throw new BadRequestException('Estado de autorizacao invalido ou desconhecido.');
    }

    if (stateRecord.consumedAt) {
      throw new BadRequestException('Estado de autorizacao ja utilizado.');
    }

    if (stateRecord.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Estado de autorizacao expirado, tente conectar novamente.');
    }

    const tokens = await this.exchangeAuthorizationCode(query.code, stateRecord.redirectUri);
    const expiresAtDate = this.computeExpiryDate(tokens.expires_in);

    const identityFallback = this.extractIdentityFromIdToken(tokens.id_token);
    const existingAccount = await this.prisma.paypalAccount.findUnique({
      where: { userId: stateRecord.userId }
    });

    if (!identityFallback.payerId && typeof tokens.payer_id === 'string') {
      identityFallback.payerId = tokens.payer_id;
    }

    const profile = await this.fetchPaypalProfile(
      tokens.access_token,
      identityFallback.payerId ?? existingAccount?.paypalPayerId ?? null
    );
    const resolvedPayerId =
      profile?.payerId ?? identityFallback.payerId ?? existingAccount?.paypalPayerId ?? null;
    const resolvedMerchantId = profile?.merchantId ?? identityFallback.merchantId ?? null;
    const resolvedEmail = profile?.email ?? identityFallback.email ?? null;

    await this.prisma.$transaction([
      this.prisma.paypalOAuthState.update({
        where: { id: stateRecord.id },
        data: { consumedAt: new Date() }
      }),
      this.prisma.paypalAccount.upsert({
        where: { userId: stateRecord.userId },
        create: {
          userId: stateRecord.userId,
          paypalPayerId: resolvedPayerId,
          merchantId: resolvedMerchantId,
          businessName: profile?.businessName ?? null,
          email: resolvedEmail,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? null,
          tokenType: tokens.token_type ?? null,
          scope: tokens.scope ?? this.resolveScopes().join(' '),
          expiresAt: expiresAtDate,
          rawTokens: this.serializeTokens(tokens, { connectionType: 'oauth' })
        },
        update: {
          paypalPayerId: resolvedPayerId,
          merchantId: resolvedMerchantId,
          businessName: profile?.businessName ?? null,
          email: resolvedEmail,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? null,
          tokenType: tokens.token_type ?? null,
          scope: tokens.scope ?? this.resolveScopes().join(' '),
          expiresAt: expiresAtDate,
          rawTokens: this.serializeTokens(tokens, { connectionType: 'oauth' })
        }
      })
    ]);

    return {
      message: 'Conta PayPal conectada com sucesso.',
      connection: {
        userId: stateRecord.userId,
        expiresAt: expiresAtDate ? expiresAtDate.toISOString() : null,
        hasRefreshToken: Boolean(tokens.refresh_token),
        scope: tokens.scope,
        email: resolvedEmail
      }
    };
  }

  async connectWithManualCredentials(
    userId: string,
    dto: PaypalManualConnectDto
  ): Promise<PaypalOAuthCallbackResult> {
    const clientId = dto.clientId.trim();
    const clientSecret = dto.clientSecret.trim();

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Informe o client_id e client_secret do PayPal.');
    }

    const tokens = await this.requestManualClientCredentialsToken(clientId, clientSecret);
    const expiresAtDate = this.computeExpiryDate(tokens.expires_in);
    const profile = await this.fetchPaypalProfile(tokens.access_token);

    const resolvedPayerId = profile?.payerId ?? tokens.payer_id ?? null;
    const resolvedMerchantId = profile?.merchantId ?? null;
    const resolvedEmail = profile?.email ?? null;

    await this.prisma.paypalAccount.upsert({
      where: { userId },
      create: {
        userId,
        paypalPayerId: resolvedPayerId,
        merchantId: resolvedMerchantId,
        businessName: profile?.businessName ?? null,
        email: resolvedEmail,
        accessToken: tokens.access_token,
        refreshToken: null,
        tokenType: tokens.token_type ?? null,
        scope: tokens.scope ?? null,
        expiresAt: expiresAtDate,
        rawTokens: this.serializeTokens(tokens, {
          connectionType: 'manual',
          manualCredentials: {
            clientId,
            clientSecret
          }
        })
      },
      update: {
        paypalPayerId: resolvedPayerId,
        merchantId: resolvedMerchantId,
        businessName: profile?.businessName ?? null,
        email: resolvedEmail,
        accessToken: tokens.access_token,
        refreshToken: null,
        tokenType: tokens.token_type ?? null,
        scope: tokens.scope ?? null,
        expiresAt: expiresAtDate,
        rawTokens: this.serializeTokens(tokens, {
          connectionType: 'manual',
          manualCredentials: {
            clientId,
            clientSecret
          }
        })
      }
    });

    return {
      message: 'Conta PayPal conectada com sucesso.',
      connection: {
        userId,
        expiresAt: expiresAtDate ? expiresAtDate.toISOString() : null,
        hasRefreshToken: false,
        scope: tokens.scope,
        email: resolvedEmail
      }
    };
  }

  /**
   * Retorna um access token valido renovando com o refresh token se necessario.
   */
  async getAccessTokenForUser(
    userId: string,
    forceRefresh = false
  ): Promise<PaypalOAuthTokenResponse> {
    const account = await this.prisma.paypalAccount.findUnique({
      where: { userId }
    });

    if (!account || !account.accessToken) {
      throw new NotFoundException('Nenhuma conta PayPal conectada para este usuario.');
    }

    const now = Date.now();
    const expiresAtMs = account.expiresAt?.getTime() ?? null;
    const needsRefresh =
      forceRefresh ||
      !expiresAtMs ||
      expiresAtMs - PaypalOAuthService.ACCESS_TOKEN_EXPIRY_SKEW_MS <= now;

    if (!needsRefresh) {
      return {
        accessToken: account.accessToken,
        expiresAt: account.expiresAt ? account.expiresAt.toISOString() : null,
        tokenType: account.tokenType ?? null,
        scope: account.scope ?? null,
        refreshed: false
      };
    }

    if (this.isManualAccount(account)) {
      const manualCredentials = this.extractManualCredentials(account);

      if (!manualCredentials) {
        throw new BadRequestException('Credenciais manuais do PayPal nao configuradas.');
      }

      const manualTokens = await this.requestManualClientCredentialsToken(
        manualCredentials.clientId,
        manualCredentials.clientSecret
      );
      const manualExpiresAt = this.computeExpiryDate(manualTokens.expires_in);

      await this.prisma.paypalAccount.update({
        where: { userId: account.userId },
        data: {
          accessToken: manualTokens.access_token,
          tokenType: manualTokens.token_type ?? null,
          scope: manualTokens.scope ?? null,
          expiresAt: manualExpiresAt,
          rawTokens: this.serializeTokens(manualTokens, {
            connectionType: 'manual',
            manualCredentials
          })
        }
      });

      return {
        accessToken: manualTokens.access_token,
        expiresAt: manualExpiresAt ? manualExpiresAt.toISOString() : null,
        tokenType: manualTokens.token_type ?? null,
        scope: manualTokens.scope ?? null,
        refreshed: true
      };
    }

    if (!account.refreshToken) {
      throw new BadRequestException(
        'Nao foi possivel renovar o token do PayPal pois nao ha refresh token salvo.'
      );
    }

    const tokens = await this.refreshAccessToken(account.refreshToken);
    const expiresAtDate = this.computeExpiryDate(tokens.expires_in);

    await this.prisma.paypalAccount.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? account.refreshToken,
        tokenType: tokens.token_type ?? account.tokenType,
        scope: tokens.scope ?? account.scope,
        expiresAt: expiresAtDate,
        rawTokens: this.serializeTokens(tokens, { connectionType: 'oauth' })
      }
    });

    return {
      accessToken: tokens.access_token,
      expiresAt: expiresAtDate ? expiresAtDate.toISOString() : null,
      tokenType: tokens.token_type ?? null,
      scope: tokens.scope ?? null,
      refreshed: true
    };
  }

  /**
   * Retorna informa��es resumidas sobre a conta PayPal vinculada.
   */
  async getConnectionStatus(userId: string): Promise<PaypalOAuthConnectionStatus> {
    const account = await this.prisma.paypalAccount.findUnique({
      where: { userId }
    });

    if (!account) {
      return {
        connected: false,
        email: null,
        scope: null,
        expiresAt: null,
        hasRefreshToken: false,
        lastSyncedAt: null,
        merchantId: null,
        payerId: null
      };
    }

    return {
      connected: true,
      email: account.email ?? null,
      scope: account.scope ?? null,
      expiresAt: account.expiresAt ? account.expiresAt.toISOString() : null,
      hasRefreshToken: Boolean(account.refreshToken),
      lastSyncedAt: account.lastSyncedAt ? account.lastSyncedAt.toISOString() : null,
      merchantId: account.merchantId ?? null,
      payerId: account.paypalPayerId ?? null
    };
  }

  private buildAuthorizeUrl(params: {
    clientId: string;
    redirectUri: string;
    state: string;
    scope: string;
    nonce?: string;
  }): string {
    const base = this.config.authBaseUrl || 'https://www.sandbox.paypal.com';
    const url = new URL('/signin/authorize', base.endsWith('/') ? base : `${base}/`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', params.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('state', params.state);
    url.searchParams.set('scope', params.scope);
    if (params.nonce) {
      url.searchParams.set('nonce', params.nonce);
    }
    return url.toString();
  }

  private async exchangeAuthorizationCode(code: string, redirectUri: string) {
    return this.requestTokens({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    });
  }

  private async refreshAccessToken(refreshToken: string) {
    return this.requestTokens({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });
  }

  private async requestTokens(payload: Record<string, string>): Promise<PaypalOAuthTokens> {
    const clientId = this.ensureClientId();
    const clientSecret = this.ensureClientSecret();
    const tokenEndpoint = this.buildTokenEndpoint();

    const fetchFn = (globalThis as {
      fetch?: (input: string, init?: unknown) => Promise<any>;
    }).fetch;

    if (!fetchFn) {
      this.logger.error('Fetch API indisponivel no ambiente do servidor.');
      throw new InternalServerErrorException('Fetch API indisponivel no ambiente do servidor.');
    }

    const headers = {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    };

    let response: any;
    try {
      response = await fetchFn(tokenEndpoint, {
        method: 'POST',
        headers,
        body: new URLSearchParams(payload).toString()
      });
    } catch (error) {
      this.logger.error(
        'Erro ao conectar com o PayPal OAuth.',
        error instanceof Error ? error.stack : String(error)
      );
      throw new InternalServerErrorException('Nao foi possivel conectar ao PayPal OAuth.');
    }

    let data: PaypalOAuthTokens | Record<string, unknown>;
    try {
      data = await response.json();
    } catch (error) {
      this.logger.error(
        'Erro ao interpretar resposta do PayPal OAuth.',
        error instanceof Error ? error.stack : String(error)
      );
      throw new InternalServerErrorException('Resposta invalida do PayPal OAuth.');
    }

    if (!response.ok) {
      this.logger.error(`Falha ao obter tokens do PayPal: ${JSON.stringify(data)}`);
      throw new InternalServerErrorException('Nao foi possivel obter tokens do PayPal.');
    }

    const tokens = data as PaypalOAuthTokens;

    if (!tokens.access_token) {
      this.logger.error(`Resposta inesperada do PayPal OAuth: ${JSON.stringify(tokens)}`);
      throw new InternalServerErrorException('Resposta inesperada do PayPal OAuth.');
    }

    return tokens;
  }

  async requestManualClientCredentialsToken(
    clientId: string,
    clientSecret: string
  ): Promise<PaypalOAuthTokens> {
    const tokenEndpoint = this.buildTokenEndpoint();
    const fetchFn = (globalThis as { fetch?: typeof fetch }).fetch;

    if (!fetchFn) {
      this.logger.error('Fetch API indisponivel no ambiente do servidor.');
      throw new InternalServerErrorException('Fetch API indisponivel no ambiente do servidor.');
    }

    const headers = {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    };

    let response: Response;
    try {
      response = await fetchFn(tokenEndpoint, {
        method: 'POST',
        headers,
        body: new URLSearchParams({ grant_type: 'client_credentials' }).toString()
      });
    } catch (error) {
      this.logger.error(
        'Erro ao conectar com o PayPal OAuth usando credenciais manuais.',
        error instanceof Error ? error.stack : String(error)
      );
      throw new InternalServerErrorException('Nao foi possivel conectar ao PayPal OAuth.');
    }

    let data: PaypalOAuthTokens | Record<string, unknown>;
    try {
      data = await response.json();
    } catch (error) {
      this.logger.error(
        'Erro ao interpretar resposta do PayPal OAuth (credenciais manuais).',
        error instanceof Error ? error.stack : String(error)
      );
      throw new InternalServerErrorException('Resposta invalida do PayPal OAuth.');
    }

    if (!response.ok) {
      this.logger.error(`Falha ao obter tokens do PayPal (manual): ${JSON.stringify(data)}`);
      throw new InternalServerErrorException('Nao foi possivel obter tokens do PayPal.');
    }

    const tokens = data as PaypalOAuthTokens;

    if (!tokens.access_token) {
      this.logger.error(
        `Resposta inesperada do PayPal OAuth (manual): ${JSON.stringify(tokens)}`
      );
      throw new InternalServerErrorException('Resposta inesperada do PayPal OAuth.');
    }

    return tokens;
  }

  private async fetchPaypalProfile(
    accessToken: string,
    payerIdForAssertion?: string | null
  ): Promise<PaypalUserProfile | null> {
    const fetchFn = (globalThis as {
      fetch?: (input: string, init?: unknown) => Promise<any>;
    }).fetch;

    if (!fetchFn) {
      return null;
    }

    const endpoint = new URL(
      '/v1/identity/oauth2/userinfo?schema=paypalv1.1',
      this.config.baseUrl || 'https://api-m.sandbox.paypal.com'
    ).toString();

    try {
      const response = await fetchFn(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        const errorPayload = await response.text();

        if (response.status === 400 || response.status === 403) {
          this.logger.debug(
            `Informacoes detalhadas da conta PayPal nao disponiveis (status ${response.status}): ${errorPayload}`
          );
        } else {
          this.logger.warn(
            `Nao foi possivel obter informacoes do usuario PayPal (status ${response.status}): ${errorPayload}`
          );
        }

        return null;
      }

      const payload = (await response.json()) as Record<string, any>;
      const email = this.extractPrimaryEmail(payload);
      const merchantId = this.extractMerchantId(payload);
      const payerId = typeof payload.payer_id === 'string' ? payload.payer_id : null;
      const businessName =
        (payload.name && typeof payload.name.business_name === 'string'
          ? payload.name.business_name
          : null) ?? (typeof payload.business_name === 'string' ? payload.business_name : null);

      return {
        payerId,
        merchantId,
        businessName,
        email
      };
    } catch (error) {
      this.logger.warn(
        'Falha ao consultar informacoes da conta PayPal.',
        error instanceof Error ? error.message : String(error)
      );
      return null;
    }
  }

  private extractPrimaryEmail(payload: Record<string, any>): string | null {
    const emails = Array.isArray(payload.emails) ? payload.emails : [];
    const primary = emails.find(
      (item) =>
        item &&
        typeof item === 'object' &&
        ('primary' in item ? item.primary === true : false) &&
        typeof item.value === 'string'
    );

    if (primary) {
      return primary.value;
    }

    const fallback = emails.find(
      (item) => item && typeof item === 'object' && typeof item.value === 'string'
    );

    if (fallback) {
      return fallback.value;
    }

    if (typeof payload.email === 'string') {
      return payload.email;
    }

    return null;
  }

  private extractIdentityFromIdToken(
    idToken?: string
  ): { payerId: string | null; merchantId: string | null; email: string | null } {
    if (!idToken) {
      return { payerId: null, merchantId: null, email: null };
    }

    const parts = idToken.split('.');
    if (parts.length < 2) {
      return { payerId: null, merchantId: null, email: null };
    }

    try {
      const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson) as Record<string, any>;
      const payerId =
        typeof payload.payer_id === 'string'
          ? payload.payer_id
          : typeof payload.payerId === 'string'
            ? payload.payerId
            : null;
      const merchantId =
        typeof payload.merchant_id === 'string'
          ? payload.merchant_id
          : typeof payload.user_id === 'string'
            ? payload.user_id
            : null;
      const email = typeof payload.email === 'string' ? payload.email : null;
      return { payerId, merchantId, email };
    } catch (error) {
      this.logger.debug(
        'Nao foi possivel interpretar o id_token do PayPal para extrair o payerId.',
        error instanceof Error ? error.message : String(error)
      );
      return { payerId: null, merchantId: null, email: null };
    }
  }

  private generatePaypalAuthAssertion(): string | null {
    return null;
  }

  private extractMerchantId(payload: Record<string, any>): string | null {
    if (typeof payload.merchant_id === 'string') {
      return payload.merchant_id;
    }

    if (typeof payload.user_id === 'string') {
      const parts = payload.user_id.split('/');
      return parts[parts.length - 1] ?? payload.user_id;
    }

    return null;
  }

  private computeExpiryDate(expiresIn?: number): Date | null {
    if (!expiresIn || expiresIn <= 0) {
      return null;
    }

    const expiresMs = Date.now() + expiresIn * 1000 - PaypalOAuthService.ACCESS_TOKEN_EXPIRY_SKEW_MS;

    if (expiresMs <= 0) {
      return null;
    }

    return new Date(expiresMs);
  }

  private ensureClientId(): string {
    if (!this.config.clientId) {
      throw new InternalServerErrorException(
        'PAYPAL_CLIENT_ID nao configurado. Atualize as variaveis de ambiente do servidor.'
      );
    }

    return this.config.clientId;
  }

  private ensureClientSecret(): string {
    if (!this.config.clientSecret) {
      throw new InternalServerErrorException(
        'PAYPAL_CLIENT_SECRET nao configurado. Atualize as variaveis de ambiente do servidor.'
      );
    }

    return this.config.clientSecret;
  }

  private ensureRedirectUri(): string {
    if (!this.config.redirectUri) {
      throw new InternalServerErrorException(
        'PAYPAL_REDIRECT_URI nao configurado. Atualize as variaveis de ambiente do servidor.'
      );
    }

    return this.config.redirectUri;
  }

  private buildTokenEndpoint(): string {
    const base = this.config.baseUrl || 'https://api-m.sandbox.paypal.com';
    return new URL('/v1/oauth2/token', base.endsWith('/') ? base : `${base}/`).toString();
  }

  private resolveScopes(): string[] {
    if (this.config.scopes.length > 0) {
      return this.config.scopes;
    }

    return ['openid', 'profile', 'email'];
  }

  private isManualAccount(account: { rawTokens: Prisma.JsonValue | null; refreshToken: string | null }): boolean {
    const metadata = this.extractTokenMetadata(account.rawTokens);

    if (metadata?.connectionType === 'manual') {
      return true;
    }

    if (metadata?.connectionType === 'oauth') {
      return false;
    }

    return !account.refreshToken;
  }

  private extractManualCredentials(account: {
    rawTokens: Prisma.JsonValue | null;
  }): { clientId: string; clientSecret: string } | null {
    const metadata = this.extractTokenMetadata(account.rawTokens);

    if (!metadata) {
      return null;
    }

    const credentials = metadata.manualCredentials ?? {
      clientId: metadata.manualClientId,
      clientSecret: metadata.manualClientSecret
    };

    if (
      credentials &&
      typeof credentials.clientId === 'string' &&
      credentials.clientId.trim().length > 0 &&
      typeof credentials.clientSecret === 'string' &&
      credentials.clientSecret.trim().length > 0
    ) {
      return {
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret
      };
    }

    return null;
  }

  private extractTokenMetadata(rawTokens: Prisma.JsonValue | null): Record<string, any> | null {
    if (!rawTokens || typeof rawTokens !== 'object') {
      return null;
    }

    return rawTokens as Record<string, any>;
  }

  private serializeTokens(
    tokens: PaypalOAuthTokens,
    metadata?: Record<string, any>
  ): Prisma.InputJsonValue {
    const payload = metadata ? { ...tokens, ...metadata } : { ...tokens };
    return JSON.parse(JSON.stringify(payload)) as Prisma.JsonObject;
  }
}
