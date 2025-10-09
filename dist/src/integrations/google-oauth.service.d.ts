import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleOAuthCallbackDto } from './dto/google-oauth-callback.dto';
export interface GoogleOAuthTokens {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
    id_token?: string;
}
export interface GoogleOAuthCallbackResult {
    message: string;
    connection: {
        userId: string;
        expiresAt: string | null;
        hasRefreshToken: boolean;
        scope?: string;
    };
}
export interface GoogleOAuthStatePayload {
    state: string;
    redirectUri: string;
    expiresAt: string;
}
export interface GoogleOAuthTokenResponse {
    accessToken: string;
    expiresAt: string | null;
    tokenType: string | null;
    scope: string | null;
    refreshed: boolean;
}
export interface GoogleOAuthConnectionStatus {
    connected: boolean;
    email: string | null;
    scope: string | null;
    expiresAt: string | null;
    hasRefreshToken: boolean;
    lastSyncedAt: string | null;
}
export declare class GoogleOAuthService {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    private static readonly STATE_TTL_MS;
    private static readonly ACCESS_TOKEN_EXPIRY_SKEW_MS;
    constructor(configService: ConfigService, prisma: PrismaService);
    createStateForUser(userId: string): Promise<GoogleOAuthStatePayload>;
    handleCallback(query: GoogleOAuthCallbackDto): Promise<GoogleOAuthCallbackResult>;
    getAccessTokenForUser(userId: string, forceRefresh?: boolean): Promise<GoogleOAuthTokenResponse>;
    private exchangeCodeForTokens;
    private refreshAccessToken;
    getConnectionStatus(userId: string): Promise<GoogleOAuthConnectionStatus>;
}
