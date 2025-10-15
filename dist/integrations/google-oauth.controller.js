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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const public_decorator_1 = require("../common/decorators/public.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const google_oauth_callback_dto_1 = require("./dto/google-oauth-callback.dto");
const google_oauth_service_1 = require("./google-oauth.service");
const google_oauth_token_request_dto_1 = require("./dto/google-oauth-token-request.dto");
let GoogleOAuthController = class GoogleOAuthController {
    constructor(googleOAuthService, configService) {
        this.googleOAuthService = googleOAuthService;
        this.configService = configService;
    }
    createState(user) {
        return this.googleOAuthService.createStateForUser(user.userId);
    }
    getToken(user, body) {
        var _a;
        return this.googleOAuthService.getAccessTokenForUser(user.userId, (_a = body.forceRefresh) !== null && _a !== void 0 ? _a : false);
    }
    getStatus(user) {
        return this.googleOAuthService.getConnectionStatus(user.userId);
    }
    async handleCallback(query, acceptHeader, res) {
        const wantsJson = acceptHeader === null || acceptHeader === void 0 ? void 0 : acceptHeader.includes('application/json');
        try {
            const result = await this.googleOAuthService.handleCallback(query);
            if (wantsJson) {
                res.status(common_1.HttpStatus.OK).json(result);
                return;
            }
            const redirectUrl = this.buildFrontendRedirectUrl('success', result.message);
            res.redirect(common_1.HttpStatus.FOUND, redirectUrl);
        }
        catch (error) {
            const status = error instanceof common_1.HttpException ? error.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = this.extractErrorMessage(error);
            if (wantsJson) {
                res.status(status).json({ message, status });
                return;
            }
            const redirectUrl = this.buildFrontendRedirectUrl('error', message);
            res.redirect(common_1.HttpStatus.FOUND, redirectUrl);
        }
    }
    buildFrontendRedirectUrl(status, message) {
        var _a, _b;
        const baseUrl = (_b = (_a = this.configService.get('FRONTEND_URL')) !== null && _a !== void 0 ? _a : this.configService.get('NEXT_PUBLIC_APP_URL')) !== null && _b !== void 0 ? _b : 'http://localhost:3000';
        const url = new URL('/integrations', baseUrl);
        url.searchParams.set('integration', 'google');
        url.searchParams.set('status', status);
        url.searchParams.set('message', message);
        return url.toString();
    }
    extractErrorMessage(error) {
        if (error instanceof common_1.HttpException) {
            const response = error.getResponse();
            if (typeof response === 'string') {
                return response;
            }
            if (typeof response === 'object' && response !== null && 'message' in response) {
                const message = response.message;
                if (Array.isArray(message)) {
                    return message.join(', ');
                }
                if (message) {
                    return message;
                }
            }
            return error.message;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return 'Erro inesperado ao processar o retorno do Google.';
    }
};
exports.GoogleOAuthController = GoogleOAuthController;
__decorate([
    (0, common_1.Post)('state'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleOAuthController.prototype, "createState", null);
__decorate([
    (0, common_1.Post)('token'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, google_oauth_token_request_dto_1.GoogleOAuthTokenRequestDto]),
    __metadata("design:returntype", Promise)
], GoogleOAuthController.prototype, "getToken", null);
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GoogleOAuthController.prototype, "getStatus", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Headers)('accept')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [google_oauth_callback_dto_1.GoogleOAuthCallbackDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GoogleOAuthController.prototype, "handleCallback", null);
exports.GoogleOAuthController = GoogleOAuthController = __decorate([
    (0, common_1.Controller)('google/oauth'),
    __metadata("design:paramtypes", [google_oauth_service_1.GoogleOAuthService,
        config_1.ConfigService])
], GoogleOAuthController);
//# sourceMappingURL=google-oauth.controller.js.map