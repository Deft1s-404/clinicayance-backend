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
var EvolutionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EvolutionService = EvolutionService_1 = class EvolutionService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EvolutionService_1.name);
        const url = this.configService.get('EVOLUTION_API_URL');
        const key = this.configService.get('EVOLUTION_API_KEY');
        const integration = this.configService.get('EVOLUTION_DEFAULT_INTEGRATION');
        const template = this.configService.get('EVOLUTION_DEFAULT_TEMPLATE');
        const channel = this.configService.get('EVOLUTION_DEFAULT_CHANNEL');
        const token = this.configService.get('EVOLUTION_DEFAULT_TOKEN');
        if (!url || !key) {
            throw new Error('Configuracoes da Evolution API ausentes. Defina EVOLUTION_API_URL e EVOLUTION_API_KEY.');
        }
        this.baseUrl = url.replace(/\/$/, '');
        this.apiKey = key;
        this.defaultIntegration = (integration !== null && integration !== void 0 ? integration : 'WHATSAPP').trim() || undefined;
        this.defaultTemplate = (template === null || template === void 0 ? void 0 : template.trim()) || undefined;
        this.defaultChannel = (channel === null || channel === void 0 ? void 0 : channel.trim()) || undefined;
        this.defaultToken = (token === null || token === void 0 ? void 0 : token.trim()) || undefined;
    }
    async createInstance(instanceName, config) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const payload = {
            instanceName,
            qrcode: true,
            ...(config !== null && config !== void 0 ? config : {})
        };
        if (!('integration' in payload) && this.defaultIntegration) {
            payload.integration = this.defaultIntegration;
        }
        if (!('channel' in payload) && this.defaultChannel) {
            payload.channel = this.defaultChannel;
        }
        if (!('template' in payload) && this.defaultTemplate) {
            payload.template = this.defaultTemplate;
        }
        if (!('token' in payload) && this.defaultToken) {
            payload.token = this.defaultToken;
        }
        const response = await this.request('/instance/create', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const instancePayload = (_a = response.instance) !== null && _a !== void 0 ? _a : {};
        const maybeInstance = (_d = (_c = (_b = instancePayload.instance) !== null && _b !== void 0 ? _b : instancePayload.instanceName) !== null && _c !== void 0 ? _c : instancePayload.name) !== null && _d !== void 0 ? _d : instanceName;
        const maybeName = (_f = (_e = instancePayload.name) !== null && _e !== void 0 ? _e : instancePayload.instanceName) !== null && _f !== void 0 ? _f : instanceName;
        const providerId = (_h = (_g = instancePayload.id) !== null && _g !== void 0 ? _g : instancePayload.instanceId) !== null && _h !== void 0 ? _h : instancePayload.uuid;
        const result = {
            id: maybeInstance !== null && maybeInstance !== void 0 ? maybeInstance : instanceName,
            name: maybeName,
            providerId,
            token: (_j = instancePayload.token) !== null && _j !== void 0 ? _j : instancePayload.sessionKey,
            raw: Object.keys(instancePayload).length ? instancePayload : undefined
        };
        return result;
    }
    async getQrCode(instanceId, number) {
        const query = number ? `?number=${encodeURIComponent(number)}` : '';
        return this.request(`/instance/connect/${instanceId}${query}`, {
            method: 'GET'
        });
    }
    async getState(instanceId) {
        try {
            return await this.request(`/instance/connectionState/${instanceId}`, {
                method: 'GET'
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException && error.getStatus() === 404) {
                return this.request(`/instance/state/${instanceId}`, {
                    method: 'GET'
                });
            }
            throw error;
        }
    }
    async logout(instanceId) {
        try {
            await this.request(`/instance/logout/${instanceId}`, {
                method: 'DELETE'
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException && error.getStatus() === 404) {
                await this.request(`/instance/${instanceId}/logout`, {
                    method: 'DELETE'
                });
                return;
            }
            throw error;
        }
    }
    async fetchInstance(instanceName, providerInstanceId) {
        const queryPath = providerInstanceId
            ? `/instance/fetchInstances?instanceId=${providerInstanceId}`
            : '/instance/fetchInstances';
        const instances = await this.request(queryPath, {
            method: 'GET'
        });
        if (!Array.isArray(instances)) {
            return null;
        }
        const match = instances.find((instance) => instance.name === instanceName ||
            instance.id === providerInstanceId ||
            instance.instanceName === instanceName ||
            instance.token === providerInstanceId);
        return match !== null && match !== void 0 ? match : null;
    }
    async delete(instanceId) {
        try {
            await this.request(`/instance/${instanceId}/delete`, {
                method: 'DELETE'
            });
        }
        catch (error) {
            if (error instanceof common_1.HttpException && error.getStatus() === 404) {
                await this.request(`/instance/delete/${instanceId}`, {
                    method: 'DELETE'
                });
                return;
            }
            throw error;
        }
    }
    async request(path, init = {}) {
        var _a, _b;
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, {
            ...init,
            headers: {
                'Content-Type': 'application/json',
                apikey: this.apiKey,
                ...init.headers
            }
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            this.logger.error(`Erro na Evolution API [${response.status}] ${url}: ${JSON.stringify(payload)}`);
            throw new common_1.HttpException((_a = payload === null || payload === void 0 ? void 0 : payload.message) !== null && _a !== void 0 ? _a : 'Erro ao comunicar com a Evolution API.', (_b = response.status) !== null && _b !== void 0 ? _b : common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return payload;
    }
};
exports.EvolutionService = EvolutionService;
exports.EvolutionService = EvolutionService = EvolutionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EvolutionService);
//# sourceMappingURL=evolution.service.js.map