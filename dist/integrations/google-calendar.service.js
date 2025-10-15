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
var GoogleCalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCalendarService = void 0;
const common_1 = require("@nestjs/common");
const googleapis_1 = require("googleapis");
const google_oauth_service_1 = require("./google-oauth.service");
let GoogleCalendarService = GoogleCalendarService_1 = class GoogleCalendarService {
    constructor(googleOAuthService) {
        this.googleOAuthService = googleOAuthService;
        this.logger = new common_1.Logger(GoogleCalendarService_1.name);
    }
    async buildClient(userId) {
        const status = await this.googleOAuthService.getConnectionStatus(userId);
        if (!status.connected) {
            throw new common_1.NotFoundException('Nenhuma conta Google vinculada a este usuario.');
        }
        const tokenResponse = await this.googleOAuthService.getAccessTokenForUser(userId);
        try {
            const auth = new googleapis_1.google.auth.OAuth2();
            auth.setCredentials({ access_token: tokenResponse.accessToken });
            return googleapis_1.google.calendar({ version: 'v3', auth });
        }
        catch (error) {
            this.logger.error('Falha ao construir cliente do Google Calendar.', error instanceof Error ? error.stack : String(error));
            throw new common_1.InternalServerErrorException('Nao foi possivel preparar integracao com o Google.');
        }
    }
    async listEvents(userId, params) {
        const client = await this.buildClient(userId);
        const response = await client.events.list(params);
        return response.data;
    }
    async getEvent(userId, params) {
        const client = await this.buildClient(userId);
        const response = await client.events.get(params);
        return response.data;
    }
    async insertEvent(userId, params) {
        const client = await this.buildClient(userId);
        const response = await client.events.insert(params);
        return response.data;
    }
    async patchEvent(userId, params) {
        const client = await this.buildClient(userId);
        const response = await client.events.patch(params);
        return response.data;
    }
    async deleteEvent(userId, params) {
        const client = await this.buildClient(userId);
        await client.events.delete(params);
    }
};
exports.GoogleCalendarService = GoogleCalendarService;
exports.GoogleCalendarService = GoogleCalendarService = GoogleCalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [google_oauth_service_1.GoogleOAuthService])
], GoogleCalendarService);
//# sourceMappingURL=google-calendar.service.js.map