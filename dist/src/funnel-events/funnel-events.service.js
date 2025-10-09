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
exports.FunnelEventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FunnelEventsService = class FunnelEventsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    recordEvent(clientId, type, meta) {
        return this.prisma.funnelEvent.create({
            data: {
                clientId,
                type,
                meta
            }
        });
    }
    countByType(types) {
        return this.prisma.$transaction(async (tx) => {
            const entries = await Promise.all(types.map(async (type) => {
                const count = await tx.funnelEvent.count({ where: { type } });
                return [type, count];
            }));
            return Object.fromEntries(entries);
        });
    }
    eventsBetween(type, start, end) {
        return this.prisma.funnelEvent.count({
            where: {
                type,
                createdAt: {
                    gte: start,
                    lte: end
                }
            }
        });
    }
};
exports.FunnelEventsService = FunnelEventsService;
exports.FunnelEventsService = FunnelEventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FunnelEventsService);
//# sourceMappingURL=funnel-events.service.js.map