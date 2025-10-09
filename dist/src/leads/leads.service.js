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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const lead_scoring_util_1 = require("../common/utils/lead-scoring.util");
const clients_service_1 = require("../clients/clients.service");
const funnel_events_service_1 = require("../funnel-events/funnel-events.service");
const leads_repository_1 = require("./leads.repository");
let LeadsService = class LeadsService {
    constructor(leadsRepository, clientsService, funnelEventsService) {
        this.leadsRepository = leadsRepository;
        this.clientsService = clientsService;
        this.funnelEventsService = funnelEventsService;
    }
    list(query) {
        return this.leadsRepository.findMany(query);
    }
    async findById(id) {
        const lead = await this.leadsRepository.findById(id);
        if (!lead) {
            throw new common_1.NotFoundException('Lead nao encontrado');
        }
        return lead;
    }
    async create(dto) {
        var _a, _b, _c;
        const client = await this.clientsService.findById(dto.clientId);
        const stage = (_a = dto.stage) !== null && _a !== void 0 ? _a : client_1.LeadStage.NEW;
        const score = (0, lead_scoring_util_1.calculateLeadScore)({
            source: (_c = (_b = dto.source) !== null && _b !== void 0 ? _b : client.source) !== null && _c !== void 0 ? _c : undefined,
            tags: client.tags,
            status: client.status,
            stage
        });
        const lead = await this.leadsRepository.create({
            client: { connect: { id: dto.clientId } },
            source: dto.source,
            notes: dto.notes,
            stage,
            score
        });
        await this.clientsService.updateScore(client.id, score);
        await this.funnelEventsService.recordEvent(client.id, 'lead_created', {
            leadId: lead.id,
            stage,
            score
        });
        if (stage === client_1.LeadStage.QUALIFIED) {
            await this.funnelEventsService.recordEvent(client.id, 'lead_qualified', {
                leadId: lead.id
            });
        }
        return lead;
    }
    async update(id, dto) {
        var _a, _b, _c, _d;
        const lead = await this.findById(id);
        const client = await this.clientsService.findById(lead.clientId);
        const stage = (_a = dto.stage) !== null && _a !== void 0 ? _a : lead.stage;
        const score = (0, lead_scoring_util_1.calculateLeadScore)({
            source: (_d = (_c = (_b = dto.source) !== null && _b !== void 0 ? _b : lead.source) !== null && _c !== void 0 ? _c : client.source) !== null && _d !== void 0 ? _d : undefined,
            tags: client.tags,
            status: client.status,
            stage
        });
        const updatedLead = await this.leadsRepository.update(id, {
            ...dto,
            stage,
            score
        });
        await this.clientsService.updateScore(client.id, score);
        if (lead.stage !== stage && stage === client_1.LeadStage.QUALIFIED) {
            await this.funnelEventsService.recordEvent(client.id, 'lead_qualified', {
                leadId: lead.id
            });
        }
        return updatedLead;
    }
    async delete(id) {
        await this.findById(id);
        return this.leadsRepository.delete(id);
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leads_repository_1.LeadsRepository,
        clients_service_1.ClientsService,
        funnel_events_service_1.FunnelEventsService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map