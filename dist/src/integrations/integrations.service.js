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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const clients_service_1 = require("../clients/clients.service");
const leads_service_1 = require("../leads/leads.service");
let IntegrationsService = class IntegrationsService {
    constructor(clientsService, leadsService) {
        this.clientsService = clientsService;
        this.leadsService = leadsService;
    }
    async syncGoogleForms(payload) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        const tagsFromPayload = (_a = payload.tags) !== null && _a !== void 0 ? _a : [];
        let client = (payload.email && (await this.clientsService.findByEmail(payload.email))) ||
            (payload.phone && (await this.clientsService.findByPhone(payload.phone))) ||
            null;
        if (!client) {
            client = await this.clientsService.create({
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                source: (_b = payload.source) !== null && _b !== void 0 ? _b : 'Google Forms',
                tags: [...tagsFromPayload, 'google_forms'],
                status: client_1.ClientStatus.NEW,
                notes: payload.notes
            });
        }
        else {
            const mergedTags = Array.from(new Set([...((_c = client.tags) !== null && _c !== void 0 ? _c : []), ...tagsFromPayload, 'google_forms']));
            await this.clientsService.update(client.id, {
                name: (_d = payload.name) !== null && _d !== void 0 ? _d : client.name,
                email: (_f = (_e = payload.email) !== null && _e !== void 0 ? _e : client.email) !== null && _f !== void 0 ? _f : undefined,
                phone: (_h = (_g = payload.phone) !== null && _g !== void 0 ? _g : client.phone) !== null && _h !== void 0 ? _h : undefined,
                source: (_k = (_j = payload.source) !== null && _j !== void 0 ? _j : client.source) !== null && _k !== void 0 ? _k : 'Google Forms',
                tags: mergedTags,
                notes: (_m = (_l = payload.notes) !== null && _l !== void 0 ? _l : client.notes) !== null && _m !== void 0 ? _m : undefined
            });
            client = await this.clientsService.findById(client.id);
        }
        const lead = await this.leadsService.create({
            clientId: client.id,
            source: (_o = payload.source) !== null && _o !== void 0 ? _o : 'Google Forms',
            notes: payload.notes,
            stage: (_p = payload.stage) !== null && _p !== void 0 ? _p : client_1.LeadStage.NEW
        });
        return {
            client,
            lead
        };
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clients_service_1.ClientsService,
        leads_service_1.LeadsService])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map