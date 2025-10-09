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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const campaigns_repository_1 = require("./campaigns.repository");
let CampaignsService = class CampaignsService {
    constructor(campaignsRepository) {
        this.campaignsRepository = campaignsRepository;
    }
    list(query) {
        return this.campaignsRepository.findMany(query);
    }
    async findById(id) {
        const campaign = await this.campaignsRepository.findById(id);
        if (!campaign) {
            throw new common_1.NotFoundException('Campanha nao encontrada');
        }
        return campaign;
    }
    create(dto) {
        var _a;
        return this.campaignsRepository.create({
            name: dto.name,
            channel: dto.channel,
            message: dto.message,
            status: (_a = dto.status) !== null && _a !== void 0 ? _a : client_1.CampaignStatus.DRAFT,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined
        });
    }
    async update(id, dto) {
        await this.findById(id);
        return this.campaignsRepository.update(id, {
            ...dto,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined
        });
    }
    async delete(id) {
        await this.findById(id);
        return this.campaignsRepository.delete(id);
    }
    async send(id) {
        var _a;
        const campaign = await this.findById(id);
        const sentAt = new Date();
        const status = campaign.status === client_1.CampaignStatus.COMPLETED ? client_1.CampaignStatus.COMPLETED : client_1.CampaignStatus.ACTIVE;
        await this.campaignsRepository.update(id, {
            status,
            scheduledAt: (_a = campaign.scheduledAt) !== null && _a !== void 0 ? _a : sentAt
        });
        const message = `Campanha enviada via ${campaign.channel} em ${sentAt.toISOString()}`;
        await this.campaignsRepository.createLog(id, message);
        return {
            campaignId: id,
            sentAt,
            message
        };
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [campaigns_repository_1.CampaignsRepository])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map