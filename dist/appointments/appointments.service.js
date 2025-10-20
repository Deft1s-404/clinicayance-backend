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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const clients_service_1 = require("../clients/clients.service");
const funnel_events_service_1 = require("../funnel-events/funnel-events.service");
const appointments_repository_1 = require("./appointments.repository");
let AppointmentsService = class AppointmentsService {
    constructor(appointmentsRepository, clientsService, funnelEventsService) {
        this.appointmentsRepository = appointmentsRepository;
        this.clientsService = clientsService;
        this.funnelEventsService = funnelEventsService;
    }
    list(query) {
        return this.appointmentsRepository.findMany(query);
    }
    async findById(id) {
        const appointment = await this.appointmentsRepository.findById(id);
        if (!appointment) {
            throw new common_1.NotFoundException('Consulta nao encontrada');
        }
        return appointment;
    }
    async create(dto) {
        var _a, _b;
        const client = await this.clientsService.findById(dto.clientId);
        const status = (_a = dto.status) !== null && _a !== void 0 ? _a : client_1.AppointmentStatus.BOOKED;
        const appointment = await this.appointmentsRepository.create({
            client: { connect: { id: dto.clientId } },
            procedure: dto.procedure,
            start: new Date(dto.start),
            end: new Date(dto.end),
            status,
            googleEventId: (_b = dto.googleEventId) !== null && _b !== void 0 ? _b : null
        });
        await this.funnelEventsService.recordEvent(client.id, 'appointment_booked', {
            appointmentId: appointment.id,
            status
        });
        if (status === client_1.AppointmentStatus.COMPLETED) {
            await this.funnelEventsService.recordEvent(client.id, 'appointment_completed', {
                appointmentId: appointment.id
            });
        }
        return appointment;
    }
    async update(id, dto) {
        var _a;
        const appointment = await this.findById(id);
        const status = (_a = dto.status) !== null && _a !== void 0 ? _a : appointment.status;
        const updated = await this.appointmentsRepository.update(id, {
            ...dto,
            start: dto.start ? new Date(dto.start) : undefined,
            end: dto.end ? new Date(dto.end) : undefined,
            status
        });
        if (appointment.status !== status) {
            if (status === client_1.AppointmentStatus.BOOKED) {
                await this.funnelEventsService.recordEvent(appointment.clientId, 'appointment_booked', {
                    appointmentId: appointment.id
                });
            }
            if (status === client_1.AppointmentStatus.COMPLETED) {
                await this.funnelEventsService.recordEvent(appointment.clientId, 'appointment_completed', {
                    appointmentId: appointment.id
                });
            }
        }
        return updated;
    }
    async delete(id) {
        await this.findById(id);
        return this.appointmentsRepository.delete(id);
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [appointments_repository_1.AppointmentsRepository,
        clients_service_1.ClientsService,
        funnel_events_service_1.FunnelEventsService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map