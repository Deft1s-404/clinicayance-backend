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
const prisma_service_1 = require("../prisma/prisma.service");
let IntegrationsService = class IntegrationsService {
    constructor(clientsService, leadsService, prisma) {
        this.clientsService = clientsService;
        this.leadsService = leadsService;
        this.prisma = prisma;
    }
    async syncGoogleForms(payload) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1;
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
                notes: payload.notes,
                age: payload.age,
                country: payload.country,
                birthDate: payload.birthDate,
                language: payload.language,
                intimateAssessmentPhotos: (_c = payload.intimateAssessmentPhotos) !== null && _c !== void 0 ? _c : [],
                anamnesisResponses: payload.anamnesisResponses
            });
        }
        else {
            const mergedTags = Array.from(new Set([...((_d = client.tags) !== null && _d !== void 0 ? _d : []), ...tagsFromPayload, 'google_forms']));
            const mergedPhotos = payload.intimateAssessmentPhotos
                ? Array.from(new Set([...((_e = client.intimateAssessmentPhotos) !== null && _e !== void 0 ? _e : []), ...payload.intimateAssessmentPhotos]))
                : undefined;
            await this.clientsService.update(client.id, {
                name: (_f = payload.name) !== null && _f !== void 0 ? _f : client.name,
                email: (_h = (_g = payload.email) !== null && _g !== void 0 ? _g : client.email) !== null && _h !== void 0 ? _h : undefined,
                phone: (_k = (_j = payload.phone) !== null && _j !== void 0 ? _j : client.phone) !== null && _k !== void 0 ? _k : undefined,
                source: (_m = (_l = payload.source) !== null && _l !== void 0 ? _l : client.source) !== null && _m !== void 0 ? _m : 'Google Forms',
                tags: mergedTags,
                notes: (_p = (_o = payload.notes) !== null && _o !== void 0 ? _o : client.notes) !== null && _p !== void 0 ? _p : undefined,
                age: payload.age,
                country: payload.country,
                birthDate: payload.birthDate,
                language: payload.language,
                intimateAssessmentPhotos: mergedPhotos,
                anamnesisResponses: payload.anamnesisResponses
            });
            client = await this.clientsService.findById(client.id);
        }
        const lead = await this.leadsService.create({
            clientId: client.id,
            source: (_q = payload.source) !== null && _q !== void 0 ? _q : 'Google Forms',
            notes: payload.notes,
            stage: (_r = payload.stage) !== null && _r !== void 0 ? _r : client_1.LeadStage.NEW
        });
        const previousTreatmentValue = this.normalizeBoolean((_v = (_t = (_s = payload.anamnesisResponses) === null || _s === void 0 ? void 0 : _s['Já realizou um tratamento estético anteriormente?']) !== null && _t !== void 0 ? _t : (_u = payload.anamnesisResponses) === null || _u === void 0 ? void 0 : _u['Ja realizou um tratamento estetico anteriormente?']) !== null && _v !== void 0 ? _v : (_w = payload.anamnesisResponses) === null || _w === void 0 ? void 0 : _w['Já realizou um tratamento estetico anteriormente?']);
        const originalResponses = payload.anamnesisResponses
            ? payload.anamnesisResponses
            : JSON.parse(JSON.stringify(payload));
        const anamnesisRecord = await this.prisma.anamnesisRecord.create({
            data: {
                name: payload.name,
                age: (_x = payload.age) !== null && _x !== void 0 ? _x : null,
                country: (_y = payload.country) !== null && _y !== void 0 ? _y : null,
                birthDate: payload.birthDate ? new Date(payload.birthDate) : null,
                language: (_z = payload.language) !== null && _z !== void 0 ? _z : null,
                phone: (_0 = payload.phone) !== null && _0 !== void 0 ? _0 : null,
                email: (_1 = payload.email) !== null && _1 !== void 0 ? _1 : null,
                previousAestheticTreatment: previousTreatmentValue !== null && previousTreatmentValue !== void 0 ? previousTreatmentValue : undefined,
                originalResponses
            }
        });
        return {
            client,
            lead,
            anamnesisRecord
        };
    }
    normalizeBoolean(value) {
        if (Array.isArray(value)) {
            return this.normalizeBoolean(value[0]);
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (['sim', 's', 'yes', 'y', 'verdadeiro', 'true'].includes(normalized)) {
                return true;
            }
            if (['nao', 'não', 'n', 'no', 'false', 'f'].includes(normalized)) {
                return false;
            }
        }
        return null;
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clients_service_1.ClientsService,
        leads_service_1.LeadsService,
        prisma_service_1.PrismaService])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map