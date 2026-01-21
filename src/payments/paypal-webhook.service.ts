import { Buffer } from 'buffer';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { paypalConfig } from '../integrations/paypal.config';
import { PaypalPaymentsService } from './paypal-payments.service';
import { PrismaService } from '../prisma/prisma.service';

interface PaypalWebhookHeaders {
  authAlgo: string | null;
  certUrl: string | null;
  transmissionId: string | null;
  transmissionSig: string | null;
  transmissionTime: string | null;
}

@Injectable()
export class PaypalWebhookService {
  private readonly logger = new Logger(PaypalWebhookService.name);

  constructor(
    @Inject(paypalConfig.KEY) private readonly config: ConfigType<typeof paypalConfig>,
    private readonly paypalPaymentsService: PaypalPaymentsService,
    private readonly prisma: PrismaService
  ) {}

  async handleEvent(headers: PaypalWebhookHeaders, rawBody: string, body: Record<string, any>) {
    if (!(await this.isSignatureValid(headers, rawBody, body))) {
      this.logger.warn('Webhook PayPal ignorado: assinatura invalida.');
      return;
    }

    const { merchantId, payerId } = this.extractIdentity(body);
    if (!merchantId && !payerId) {
      this.logger.warn('Webhook PayPal ignorado: nao foi possivel identificar merchant/payer.');
      return;
    }

    const account = await this.prisma.paypalAccount.findFirst({
      where: {
        OR: [
          merchantId ? { merchantId } : undefined,
          payerId ? { paypalPayerId: payerId } : undefined
        ].filter(Boolean) as any
      }
    });

    if (!account) {
      this.logger.warn(
        `Webhook PayPal ignorado: nenhuma conta vinculada para merchantId=${merchantId} payerId=${payerId}.`
      );
      return;
    }

    const referenceDate = this.extractEventDate(body);
    const windowMs = 60 * 60 * 1000;
    const startDate = new Date(referenceDate.getTime() - windowMs).toISOString();
    const endDate = new Date(referenceDate.getTime() + windowMs).toISOString();

    await this.paypalPaymentsService.syncTransactions(account.userId, {
      startDate,
      endDate
    });
  }

  private async isSignatureValid(
    headers: PaypalWebhookHeaders,
    rawBody: string,
    body: Record<string, any>
  ): Promise<boolean> {
    if (!this.config.webhookId) {
      this.logger.warn('PAYPAL_WEBHOOK_ID nao configurado. Ignorando verificacao.');
      return true;
    }

    const accessToken = await this.requestAppAccessToken();
    const fetchFn = (globalThis as { fetch?: typeof fetch }).fetch;
    if (!fetchFn) {
      this.logger.warn('Fetch API indisponivel para verificar assinatura do PayPal.');
      return false;
    }

    const response = await fetchFn(
      new URL('/v1/notifications/verify-webhook-signature', this.config.baseUrl).toString(),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auth_algo: headers.authAlgo,
          cert_url: headers.certUrl,
          transmission_id: headers.transmissionId,
          transmission_sig: headers.transmissionSig,
          transmission_time: headers.transmissionTime,
          webhook_id: this.config.webhookId,
          webhook_event: rawBody ? JSON.parse(rawBody) : body
        })
      }
    );

    if (!response.ok) {
      this.logger.warn(`Falha ao verificar assinatura PayPal: ${response.status}`);
      return false;
    }

    const payload = (await response.json()) as { verification_status?: string };
    return payload.verification_status === 'SUCCESS';
  }

  private async requestAppAccessToken(): Promise<string> {
    const clientId = this.config.clientId;
    const clientSecret = this.config.clientSecret;
    if (!clientId || !clientSecret) {
      throw new Error('PAYPAL_CLIENT_ID ou PAYPAL_CLIENT_SECRET ausente.');
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const fetchFn = (globalThis as { fetch?: typeof fetch }).fetch;
    if (!fetchFn) {
      throw new Error('Fetch API indisponivel para solicitar access token do PayPal.');
    }

    const response = await fetchFn(
      new URL('/v1/oauth2/token', this.config.baseUrl).toString(),
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      }
    );

    if (!response.ok) {
      throw new Error('Nao foi possivel obter access token do PayPal.');
    }

    const payload = (await response.json()) as { access_token?: string };
    if (!payload.access_token) {
      throw new Error('Resposta inesperada ao solicitar access token do PayPal.');
    }

    return payload.access_token;
  }

  private extractIdentity(body: Record<string, any>): { merchantId: string | null; payerId: string | null } {
    const resource = body.resource ?? {};
    const merchantId =
      resource?.payee?.merchant_id ??
      resource?.merchant_id ??
      resource?.seller_receivable_breakdown?.payee?.merchant_id ??
      null;
    const payerId =
      resource?.payee?.payer_id ??
      resource?.payer?.payer_id ??
      resource?.supplementary_data?.related_ids?.payer_id ??
      null;

    return { merchantId: typeof merchantId === 'string' ? merchantId : null, payerId: typeof payerId === 'string' ? payerId : null };
  }

  private extractEventDate(body: Record<string, any>): Date {
    const dateString =
      (body.resource && (body.resource.update_time || body.resource.create_time)) ||
      body.event_time ||
      body.create_time;

    const parsed = dateString ? new Date(dateString) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
  }
}
