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
exports.LeadsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeadsRepository = class LeadsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(query) {
        const { page = 1, limit = 20, search, stage } = query;
        const where = {
            ...(stage ? { stage } : {}),
            ...(search
                ? {
                    OR: [
                        { source: { contains: search, mode: 'insensitive' } },
                        { client: { name: { contains: search, mode: 'insensitive' } } }
                    ]
                }
                : {})
        };
        const [data, total] = await Promise.all([
            this.prisma.lead.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    client: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.lead.count({ where })
        ]);
        return { data, total, page, limit };
    }
    findById(id) {
        return this.prisma.lead.findUnique({
            where: { id },
            include: { client: true }
        });
    }
    create(data) {
        return this.prisma.lead.create({ data });
    }
    update(id, data) {
        return this.prisma.lead.update({ where: { id }, data });
    }
    delete(id) {
        return this.prisma.lead.delete({ where: { id } });
    }
};
exports.LeadsRepository = LeadsRepository;
exports.LeadsRepository = LeadsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsRepository);
//# sourceMappingURL=leads.repository.js.map