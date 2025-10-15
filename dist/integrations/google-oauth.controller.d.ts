import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { GoogleOAuthCallbackDto } from './dto/google-oauth-callback.dto';
import { GoogleOAuthService, GoogleOAuthTokenResponse, GoogleOAuthStatePayload, GoogleOAuthConnectionStatus } from './google-oauth.service';
import { GoogleOAuthTokenRequestDto } from './dto/google-oauth-token-request.dto';
type AuthenticatedUser = {
    userId: string;
    email: string;
};
export declare class GoogleOAuthController {
    private readonly googleOAuthService;
    private readonly configService;
    constructor(googleOAuthService: GoogleOAuthService, configService: ConfigService);
    createState(user: AuthenticatedUser): Promise<GoogleOAuthStatePayload>;
    getToken(user: AuthenticatedUser, body: GoogleOAuthTokenRequestDto): Promise<GoogleOAuthTokenResponse>;
    getStatus(user: AuthenticatedUser): Promise<GoogleOAuthConnectionStatus>;
    handleCallback(query: GoogleOAuthCallbackDto, acceptHeader: string | undefined, res: Response): Promise<void>;
    private buildFrontendRedirectUrl;
    private extractErrorMessage;
}
export {};
