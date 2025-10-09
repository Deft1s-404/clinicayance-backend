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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
const funnel_events_service_1 = require("../funnel-events/funnel-events.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma, funnelEventsService) {
        this.prisma = prisma;
        this.funnelEventsService = funnelEventsService;
    }
    async funnel() {
        const counts = await this.funnelEventsService.countByType([
            'lead_created',
            'lead_qualified',
            'appointment_booked',
            'appointment_completed',
            'payment_confirmed'
        ]);
        const conversionRate = counts.lead_created && counts.payment_confirmed
            ? Number(((counts.payment_confirmed / counts.lead_created) * 100).toFixed(2))
            : 0;
        return {
            counts,
            conversionRate
        };
    }
    async revenue(period, range) {
        const payments = await this.prisma.payment.findMany({
            where: {
                status: client_1.PaymentStatus.CONFIRMED,
                createdAt: {
                    gte: range.start ? new Date(range.start) : undefined,
                    lte: range.end ? new Date(range.end) : undefined
                }
            }
        });
        const grouped = payments.reduce((acc, payment) => {
            var _a;
            const key = period === 'month'
                ? (0, dayjs_1.default)(payment.createdAt).format('YYYY-MM')
                : (0, dayjs_1.default)(payment.createdAt).format('YYYY-MM-DD');
            acc[key] = ((_a = acc[key]) !== null && _a !== void 0 ? _a : 0) + Number(payment.value);
            return acc;
        }, {});
        const series = Object.entries(grouped)
            .map(([label, total]) => ({ label, total }))
            .sort((a, b) => (a.label > b.label ? 1 : -1));
        const total = series.reduce((sum, item) => sum + item.total, 0);
        return { total, series };
    }
    async appointments(range) {
        const appointments = await this.prisma.appointment.findMany({
            where: {
                start: range.start ? { gte: new Date(range.start) } : undefined,
                end: range.end ? { lte: new Date(range.end) } : undefined
            }
        });
        const byStatus = Object.values(client_1.AppointmentStatus).reduce((acc, status) => {
            acc[status] = 0;
            return acc;
        }, {});
        appointments.forEach((appointment) => {
            var _a;
            byStatus[appointment.status] = ((_a = byStatus[appointment.status]) !== null && _a !== void 0 ? _a : 0) + 1;
        });
        const byWeek = appointments.reduce((acc, appointment) => {
            var _a;
            const week = (0, dayjs_1.default)(appointment.start).format('YYYY-[W]WW');
            acc[week] = ((_a = acc[week]) !== null && _a !== void 0 ? _a : 0) + 1;
            return acc;
        }, {});
        return {
            byStatus,
            byWeek: Object.entries(byWeek)
                .map(([label, total]) => ({ label, total }))
                .sort((a, b) => (a.label > b.label ? 1 : -1))
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        funnel_events_service_1.FunnelEventsService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map