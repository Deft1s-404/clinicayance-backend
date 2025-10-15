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
exports.AppointmentsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AppointmentsRepository = class AppointmentsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(query) {
        const { page = 1, limit = 20, status, start, end, search } = query;
        const where = {
            ...(status ? { status } : {}),
            ...(start || end
                ? {
                    start: start ? { gte: new Date(start) } : undefined,
                    end: end ? { lte: new Date(end) } : undefined
                }
                : {}),
            ...(search
                ? { client: { name: { contains: search, mode: 'insensitive' } } }
                : {})
        };
        const [data, total] = await Promise.all([
            this.prisma.appointment.findMany({
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
                orderBy: { start: 'desc' }
            }),
            this.prisma.appointment.count({ where })
        ]);
        return { data, total, page, limit };
    }
    findById(id) {
        return this.prisma.appointment.findUnique({
            where: { id },
            include: {
                client: true,
                payments: true
            }
        });
    }
    create(data) {
        return this.prisma.appointment.create({ data });
    }
    update(id, data) {
        return this.prisma.appointment.update({ where: { id }, data });
    }
    delete(id) {
        return this.prisma.appointment.delete({ where: { id } });
    }
};
exports.AppointmentsRepository = AppointmentsRepository;
exports.AppointmentsRepository = AppointmentsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentsRepository);
//# sourceMappingURL=appointments.repository.js.map