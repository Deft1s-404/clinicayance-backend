
import { Injectable, NotFoundException } from '@nestjs/common';
import { Appointment, AppointmentStatus, AppointmentType } from '@prisma/client';

import { ClientsService } from '../clients/clients.service';
import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import { AppointmentsRepository, PaginatedAppointments } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly clientsService: ClientsService,
    private readonly funnelEventsService: FunnelEventsService
  ) {}

  list(query: ListAppointmentsDto): Promise<PaginatedAppointments> {
    return this.appointmentsRepository.findMany(query);
  }

  async findById(id: string) {
    const appointment = await this.appointmentsRepository.findById(id);

    if (!appointment) {
      throw new NotFoundException('Consulta nao encontrada');
    }

    return appointment;
  }

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const client = await this.clientsService.findById(dto.clientId);
    const status = dto.status ?? AppointmentStatus.BOOKED;
    const type = dto.type ?? AppointmentType.IN_PERSON;
    const meetingLink = dto.meetingLink?.trim() || null;

    const appointment = await this.appointmentsRepository.create({
      client: { connect: { id: dto.clientId } },
      procedure: dto.procedure,
      country: dto.country ?? 'Brasil',
      type,
      meetingLink,
      start: new Date(dto.start),
      end: new Date(dto.end),
      status,
      googleEventId: dto.googleEventId ?? null
    });

    await this.funnelEventsService.recordEvent(client.id, 'appointment_booked', {
      appointmentId: appointment.id,
      status
    });

    if (status === AppointmentStatus.COMPLETED) {
      await this.funnelEventsService.recordEvent(client.id, 'appointment_completed', {
        appointmentId: appointment.id
      });
    }

    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findById(id);
    const status = dto.status ?? appointment.status;
    const type = dto.type ?? appointment.type ?? AppointmentType.IN_PERSON;
    const meetingLink =
      dto.meetingLink !== undefined ? dto.meetingLink?.trim() || null : appointment.meetingLink ?? null;

    const updated = await this.appointmentsRepository.update(id, {
      ...dto,
      start: dto.start ? new Date(dto.start) : undefined,
      end: dto.end ? new Date(dto.end) : undefined,
      status,
      type,
      meetingLink
    });

    if (appointment.status !== status) {
      if (status === AppointmentStatus.BOOKED) {
        await this.funnelEventsService.recordEvent(appointment.clientId, 'appointment_booked', {
          appointmentId: appointment.id
        });
      }

      if (status === AppointmentStatus.COMPLETED) {
        await this.funnelEventsService.recordEvent(appointment.clientId, 'appointment_completed', {
          appointmentId: appointment.id
        });
      }
    }

    return updated;
  }

  async delete(id: string): Promise<Appointment> {
    await this.findById(id);
    return this.appointmentsRepository.delete(id);
  }
}
