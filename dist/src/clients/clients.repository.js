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
exports.ClientsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientsRepository = class ClientsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(query) {
        const { page = 1, limit = 20, search } = query;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } }
                ]
            }
            : undefined;
        const [data, total] = await Promise.all([
            this.prisma.client.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.client.count({ where })
        ]);
        return { data, total, page, limit };
    }
    findById(id) {
        return this.prisma.client.findUnique({
            where: { id },
            include: {
                leads: true,
                appointments: true,
                payments: true
            }
        });
    }
    findByEmail(email) {
        return this.prisma.client.findUnique({ where: { email } });
    }
    findByPhone(phone) {
        return this.prisma.client.findFirst({ where: { phone } });
    }
    create(data) {
        return this.prisma.client.create({ data });
    }
    update(id, data) {
        return this.prisma.client.update({ where: { id }, data });
    }
    delete(id) {
        return this.prisma.client.delete({ where: { id } });
    }
};
exports.ClientsRepository = ClientsRepository;
exports.ClientsRepository = ClientsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientsRepository);
//# sourceMappingURL=clients.repository.js.map