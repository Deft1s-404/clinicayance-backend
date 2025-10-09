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
exports.PaymentsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsRepository = class PaymentsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(query) {
        const { page = 1, limit = 20, status, search } = query;
        const where = {
            ...(status ? { status } : {}),
            ...(search
                ? {
                    OR: [
                        { method: { contains: search, mode: 'insensitive' } },
                        { appointment: { client: { name: { contains: search, mode: 'insensitive' } } } },
                        { client: { name: { contains: search, mode: 'insensitive' } } }
                    ]
                }
                : {})
        };
        const [data, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    appointment: {
                        select: {
                            id: true,
                            procedure: true,
                            client: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    client: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.payment.count({ where })
        ]);
        return { data, total, page, limit };
    }
    findById(id) {
        return this.prisma.payment.findUnique({
            where: { id },
            include: {
                appointment: {
                    include: {
                        client: true
                    }
                },
                client: true
            }
        });
    }
    findByPixTxid(pixTxid) {
        return this.prisma.payment.findFirst({
            where: { pixTxid }
        });
    }
    create(data) {
        return this.prisma.payment.create({ data });
    }
    update(id, data) {
        return this.prisma.payment.update({ where: { id }, data });
    }
    delete(id) {
        return this.prisma.payment.delete({ where: { id } });
    }
};
exports.PaymentsRepository = PaymentsRepository;
exports.PaymentsRepository = PaymentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsRepository);
//# sourceMappingURL=payments.repository.js.map