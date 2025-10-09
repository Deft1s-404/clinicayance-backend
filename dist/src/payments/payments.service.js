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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const appointments_service_1 = require("../appointments/appointments.service");
const funnel_events_service_1 = require("../funnel-events/funnel-events.service");
const payments_repository_1 = require("./payments.repository");
const asNumber = (value) => typeof value === 'number' ? value : Number(value);
let PaymentsService = class PaymentsService {
    constructor(paymentsRepository, appointmentsService, funnelEventsService) {
        this.paymentsRepository = paymentsRepository;
        this.appointmentsService = appointmentsService;
        this.funnelEventsService = funnelEventsService;
    }
    list(query) {
        return this.paymentsRepository.findMany(query);
    }
    async findById(id) {
        const payment = await this.paymentsRepository.findById(id);
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento nao encontrado');
        }
        return payment;
    }
    async create(dto) {
        var _a;
        const appointment = await this.appointmentsService.findById(dto.appointmentId);
        const status = (_a = dto.status) !== null && _a !== void 0 ? _a : client_1.PaymentStatus.PENDING;
        const payment = await this.paymentsRepository.create({
            appointment: { connect: { id: dto.appointmentId } },
            client: { connect: { id: appointment.clientId } },
            value: dto.value,
            method: dto.method,
            status,
            pixTxid: dto.pixTxid,
            comprovanteUrl: dto.comprovanteUrl
        });
        if (status === client_1.PaymentStatus.CONFIRMED) {
            await this.funnelEventsService.recordEvent(appointment.clientId, 'payment_confirmed', {
                paymentId: payment.id,
                value: asNumber(payment.value)
            });
        }
        return payment;
    }
    async update(id, dto) {
        var _a;
        const payment = await this.findById(id);
        const status = (_a = dto.status) !== null && _a !== void 0 ? _a : payment.status;
        const updated = await this.paymentsRepository.update(id, {
            ...dto,
            status
        });
        if (payment.status !== status && status === client_1.PaymentStatus.CONFIRMED) {
            const appointment = await this.appointmentsService.findById(payment.appointmentId);
            await this.funnelEventsService.recordEvent(appointment.clientId, 'payment_confirmed', {
                paymentId: payment.id,
                value: asNumber(updated.value)
            });
        }
        return updated;
    }
    async delete(id) {
        await this.findById(id);
        return this.paymentsRepository.delete(id);
    }
    async handleWebhook(dto) {
        var _a;
        const payment = await this.paymentsRepository.findByPixTxid(dto.pixTxid);
        if (!payment) {
            throw new common_1.NotFoundException('Pagamento nao localizado para o webhook informado');
        }
        const updated = await this.paymentsRepository.update(payment.id, {
            status: (_a = dto.status) !== null && _a !== void 0 ? _a : client_1.PaymentStatus.CONFIRMED
        });
        if (updated.status === client_1.PaymentStatus.CONFIRMED) {
            const appointment = await this.appointmentsService.findById(payment.appointmentId);
            await this.funnelEventsService.recordEvent(appointment.clientId, 'payment_confirmed', {
                paymentId: updated.id,
                value: asNumber(updated.value),
                pixTxid: payment.pixTxid
            });
        }
        return updated;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_repository_1.PaymentsRepository,
        appointments_service_1.AppointmentsService,
        funnel_events_service_1.FunnelEventsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map