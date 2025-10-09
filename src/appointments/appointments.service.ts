import { Injectable, NotFoundException } from '@nestjs/common';
import { Appointment, AppointmentStatus } from '@prisma/client';

import { ClientsService } from '../clients/clients.service';
import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import {
  AppointmentQuery,
  AppointmentsRepository,
  PaginatedAppointments
} from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentsRepository: AppointmentsRepository,
    private readonly clientsService: ClientsService,
    private readonly funnelEventsService: FunnelEventsService
  ) {}

  list(query: AppointmentQuery): Promise<PaginatedAppointments> {
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

    const appointment = await this.appointmentsRepository.create({
      client: { connect: { id: dto.clientId } },
      procedure: dto.procedure,
      start: new Date(dto.start),
      end: new Date(dto.end),
      status
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

    const updated = await this.appointmentsRepository.update(id, {
      ...dto,
      start: dto.start ? new Date(dto.start) : undefined,
      end: dto.end ? new Date(dto.end) : undefined,
      status
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
