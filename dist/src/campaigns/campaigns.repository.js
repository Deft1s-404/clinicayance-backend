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
exports.CampaignsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CampaignsRepository = class CampaignsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(query) {
        const { page = 1, limit = 20, search } = query;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { channel: { contains: search, mode: 'insensitive' } }
                ]
            }
            : undefined;
        const [data, total] = await Promise.all([
            this.prisma.campaign.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    logs: {
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.campaign.count({ where })
        ]);
        return { data, total, page, limit };
    }
    findById(id) {
        return this.prisma.campaign.findUnique({
            where: { id },
            include: { logs: { orderBy: { createdAt: 'desc' } } }
        });
    }
    create(data) {
        return this.prisma.campaign.create({ data });
    }
    update(id, data) {
        return this.prisma.campaign.update({ where: { id }, data });
    }
    delete(id) {
        return this.prisma.campaign.delete({ where: { id } });
    }
    createLog(campaignId, message) {
        return this.prisma.campaignLog.create({
            data: { campaignId, message }
        });
    }
};
exports.CampaignsRepository = CampaignsRepository;
exports.CampaignsRepository = CampaignsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsRepository);
//# sourceMappingURL=campaigns.repository.js.map