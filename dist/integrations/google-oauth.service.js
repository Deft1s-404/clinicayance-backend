"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleOAuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let GoogleOAuthService = GoogleOAuthService_1 = class GoogleOAuthService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(GoogleOAuthService_1.name);
    }
    async createStateForUser(userId) {
        const redirectUri = this.configService.get('GOOGLE_OAUTH_REDIRECT_URI');
        if (!redirectUri) {
            throw new common_1.InternalServerErrorException('Redirect URI do Google OAuth nao esta configurada no servidor.');
        }
        const state = (0, crypto_1.randomUUID)();
        const expiresAtDate = new Date(Date.now() + GoogleOAuthService_1.STATE_TTL_MS);
        await this.prisma.googleOAuthState.create({
            data: {
                state,
                userId,
                redirectUri,
                expiresAt: expiresAtDate
            }
        });
        return {
            state,
            redirectUri,
            expiresAt: expiresAtDate.toISOString()
        };
    }
    async handleCallback(query) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (query.error) {
            this.logger.warn(`Google OAuth returned an error: ${query.error}`);
            throw new common_1.BadRequestException(`Integracao com o Google falhou: ${query.error}`);
        }
        if (!query.code) {
            throw new common_1.BadRequestException('Codigo de autorizacao ausente na resposta do Google.');
        }
        const stateRecord = await this.prisma.googleOAuthState.findUnique({
            where: { state: query.state }
        });
        if (!stateRecord) {
            throw new common_1.BadRequestException('Estado de autorizacao invalido ou desconhecido.');
        }
        if (stateRecord.consumedAt) {
            throw new common_1.BadRequestException('Estado de autorizacao ja utilizado.');
        }
        if (stateRecord.expiresAt.getTime() < Date.now()) {
            throw new common_1.BadRequestException('Estado de autorizacao expirado, tente conectar novamente.');
        }
        const tokens = await this.exchangeCodeForTokens(query.code, stateRecord.redirectUri);
        const expiryDate = typeof tokens.expires_in === 'number'
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : null;
        const existingAccount = await this.prisma.googleAccount.findUnique({
            where: { userId: stateRecord.userId }
        });
        const rawTokens = JSON.parse(JSON.stringify(tokens));
        if (!existingAccount) {
            await this.prisma.googleAccount.create({
                data: {
                    userId: stateRecord.userId,
                    refreshToken: (_a = tokens.refresh_token) !== null && _a !== void 0 ? _a : null,
                    accessToken: tokens.access_token,
                    tokenType: (_b = tokens.token_type) !== null && _b !== void 0 ? _b : null,
                    scope: (_c = tokens.scope) !== null && _c !== void 0 ? _c : null,
                    expiryDate,
                    rawTokens
                }
            });
        }
        else {
            await this.prisma.googleAccount.update({
                where: { userId: stateRecord.userId },
                data: {
                    accessToken: tokens.access_token,
                    tokenType: (_e = (_d = tokens.token_type) !== null && _d !== void 0 ? _d : existingAccount.tokenType) !== null && _e !== void 0 ? _e : undefined,
                    scope: (_g = (_f = tokens.scope) !== null && _f !== void 0 ? _f : existingAccount.scope) !== null && _g !== void 0 ? _g : undefined,
                    expiryDate: (_h = expiryDate !== null && expiryDate !== void 0 ? expiryDate : existingAccount.expiryDate) !== null && _h !== void 0 ? _h : undefined,
                    rawTokens,
                    ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {})
                }
            });
        }
        await this.prisma.googleOAuthState.update({
            where: { state: query.state },
            data: {
                consumedAt: new Date()
            }
        });
        return {
            message: 'Google OAuth conectado com sucesso.',
            connection: {
                userId: stateRecord.userId,
                expiresAt: expiryDate ? expiryDate.toISOString() : null,
                hasRefreshToken: Boolean((_j = tokens.refresh_token) !== null && _j !== void 0 ? _j : existingAccount === null || existingAccount === void 0 ? void 0 : existingAccount.refreshToken),
                scope: tokens.scope
            }
        };
    }
    async getAccessTokenForUser(userId, forceRefresh = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const account = await this.prisma.googleAccount.findUnique({
            where: { userId },
            include: { user: true }
        });
        if (!account) {
            throw new common_1.NotFoundException('Conta do Google nao encontrada para este usuario.');
        }
        const now = Date.now();
        const expiresAtTime = (_b = (_a = account.expiryDate) === null || _a === void 0 ? void 0 : _a.getTime()) !== null && _b !== void 0 ? _b : 0;
        const shouldRefresh = forceRefresh ||
            !account.accessToken ||
            !account.expiryDate ||
            expiresAtTime <= now + GoogleOAuthService_1.ACCESS_TOKEN_EXPIRY_SKEW_MS;
        if (!shouldRefresh) {
            return {
                accessToken: (_c = account.accessToken) !== null && _c !== void 0 ? _c : '',
                expiresAt: account.expiryDate ? account.expiryDate.toISOString() : null,
                tokenType: (_d = account.tokenType) !== null && _d !== void 0 ? _d : null,
                scope: (_e = account.scope) !== null && _e !== void 0 ? _e : null,
                refreshed: false
            };
        }
        if (!account.refreshToken) {
            throw new common_1.BadRequestException('Conta Google nao possui refresh token. Refaça a conexao com o Google.');
        }
        const tokens = await this.refreshAccessToken(account.refreshToken);
        const rawTokens = JSON.parse(JSON.stringify(tokens));
        const expiryDate = typeof tokens.expires_in === 'number'
            ? new Date(Date.now() + tokens.expires_in * 1000)
            : (_f = account.expiryDate) !== null && _f !== void 0 ? _f : null;
        const updateData = {
            accessToken: tokens.access_token,
            tokenType: (_h = (_g = tokens.token_type) !== null && _g !== void 0 ? _g : account.tokenType) !== null && _h !== void 0 ? _h : null,
            scope: (_k = (_j = tokens.scope) !== null && _j !== void 0 ? _j : account.scope) !== null && _k !== void 0 ? _k : null,
            expiryDate,
            rawTokens
        };
        if (tokens.refresh_token) {
            updateData.refreshToken = tokens.refresh_token;
        }
        const updatedAccount = await this.prisma.googleAccount.update({
            where: { userId },
            data: updateData
        });
        return {
            accessToken: (_l = updatedAccount.accessToken) !== null && _l !== void 0 ? _l : tokens.access_token,
            expiresAt: updatedAccount.expiryDate ? updatedAccount.expiryDate.toISOString() : null,
            tokenType: (_m = updatedAccount.tokenType) !== null && _m !== void 0 ? _m : null,
            scope: (_o = updatedAccount.scope) !== null && _o !== void 0 ? _o : null,
            refreshed: true
        };
    }
    async exchangeCodeForTokens(code, redirectUri) {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        if (!clientId || !clientSecret || !redirectUri) {
            throw new common_1.InternalServerErrorException('Credenciais do Google OAuth nao configuradas corretamente.');
        }
        const tokenEndpoint = 'https://oauth2.googleapis.com/token';
        const body = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        });
        const fetchFn = globalThis.fetch;
        if (!fetchFn) {
            this.logger.error('Fetch API indisponivel no ambiente do servidor.');
            throw new common_1.InternalServerErrorException('Fetch API indisponivel no ambiente do servidor.');
        }
        let response;
        try {
            response = await fetchFn(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });
        }
        catch (error) {
            this.logger.error('Erro ao conectar com o Google OAuth.', error instanceof Error ? error.stack : String(error));
            throw new common_1.InternalServerErrorException('Nao foi possivel contatar o Google OAuth.');
        }
        let payload;
        try {
            payload = await response.json();
        }
        catch (error) {
            this.logger.error('Erro ao interpretar resposta do Google OAuth.', error instanceof Error ? error.stack : String(error));
            throw new common_1.InternalServerErrorException('Resposta invalida do Google OAuth.');
        }
        if (!response.ok) {
            this.logger.error(`Falha ao trocar codigo do Google OAuth: ${JSON.stringify(payload)}`);
            throw new common_1.InternalServerErrorException('Nao foi possivel trocar o codigo de autorizacao do Google.');
        }
        const tokens = payload;
        if (!tokens.access_token) {
            this.logger.error(`Resposta inesperada do Google OAuth: ${JSON.stringify(payload)}`);
            throw new common_1.InternalServerErrorException('Resposta inesperada do Google OAuth.');
        }
        return tokens;
    }
    async refreshAccessToken(refreshToken) {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        if (!clientId || !clientSecret) {
            throw new common_1.InternalServerErrorException('Credenciais do Google OAuth nao configuradas corretamente.');
        }
        const tokenEndpoint = 'https://oauth2.googleapis.com/token';
        const body = new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token'
        });
        const fetchFn = globalThis.fetch;
        if (!fetchFn) {
            this.logger.error('Fetch API indisponivel no ambiente do servidor.');
            throw new common_1.InternalServerErrorException('Fetch API indisponivel no ambiente do servidor.');
        }
        let response;
        try {
            response = await fetchFn(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: body.toString()
            });
        }
        catch (error) {
            this.logger.error('Erro ao conectar com o Google OAuth (refresh).', error instanceof Error ? error.stack : String(error));
            throw new common_1.InternalServerErrorException('Nao foi possivel atualizar o token junto ao Google.');
        }
        let payload;
        try {
            payload = await response.json();
        }
        catch (error) {
            this.logger.error('Erro ao interpretar resposta do Google OAuth (refresh).', error instanceof Error ? error.stack : String(error));
            throw new common_1.InternalServerErrorException('Resposta invalida do Google OAuth ao atualizar token.');
        }
        if (!response.ok) {
            this.logger.error(`Falha ao atualizar token do Google OAuth: ${JSON.stringify(payload)}`);
            throw new common_1.InternalServerErrorException('Nao foi possivel atualizar o token do Google.');
        }
        const tokens = payload;
        if (!tokens.access_token) {
            this.logger.error(`Resposta inesperada do Google OAuth (refresh): ${JSON.stringify(payload)}`);
            throw new common_1.InternalServerErrorException('Resposta inesperada do Google OAuth ao atualizar token.');
        }
        return tokens;
    }
    async getConnectionStatus(userId) {
        var _a, _b, _c, _d;
        const account = await this.prisma.googleAccount.findUnique({
            where: { userId },
            include: { user: true }
        });
        if (!account) {
            return {
                connected: false,
                email: null,
                scope: null,
                expiresAt: null,
                hasRefreshToken: false,
                lastSyncedAt: null
            };
        }
        return {
            connected: true,
            email: (_c = (_a = account.email) !== null && _a !== void 0 ? _a : (_b = account.user) === null || _b === void 0 ? void 0 : _b.email) !== null && _c !== void 0 ? _c : null,
            scope: (_d = account.scope) !== null && _d !== void 0 ? _d : null,
            expiresAt: account.expiryDate ? account.expiryDate.toISOString() : null,
            hasRefreshToken: Boolean(account.refreshToken),
            lastSyncedAt: account.updatedAt ? account.updatedAt.toISOString() : null
        };
    }
};
exports.GoogleOAuthService = GoogleOAuthService;
GoogleOAuthService.STATE_TTL_MS = 10 * 60 * 1000;
GoogleOAuthService.ACCESS_TOKEN_EXPIRY_SKEW_MS = 60 * 1000;
exports.GoogleOAuthService = GoogleOAuthService = GoogleOAuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], GoogleOAuthService);
//# sourceMappingURL=google-oauth.service.js.map