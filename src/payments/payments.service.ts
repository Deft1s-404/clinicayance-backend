import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment, PaymentStatus, Prisma } from '@prisma/client';

import { AppointmentsService } from '../appointments/appointments.service';
import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import {
  PaginatedPayments,
  PaymentsQuery,
  PaymentsRepository
} from './payments.repository';

const asNumber = (value: Prisma.Decimal | number): number =>
  typeof value === 'number' ? value : Number(value);

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appointmentsService: AppointmentsService,
    private readonly funnelEventsService: FunnelEventsService
  ) {}

  list(query: PaymentsQuery): Promise<PaginatedPayments> {
    return this.paymentsRepository.findMany(query);
  }

  async findById(id: string) {
    const payment = await this.paymentsRepository.findById(id);

    if (!payment) {
      throw new NotFoundException('Pagamento nao encontrado');
    }

    return payment;
  }

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const appointment = await this.appointmentsService.findById(dto.appointmentId);
    const status = dto.status ?? PaymentStatus.PENDING;

    const payment = await this.paymentsRepository.create({
      appointment: { connect: { id: dto.appointmentId } },
      client: { connect: { id: appointment.clientId } },
      value: dto.value,
      method: dto.method,
      status,
      pixTxid: dto.pixTxid,
      comprovanteUrl: dto.comprovanteUrl
    });

    if (status === PaymentStatus.CONFIRMED) {
      await this.funnelEventsService.recordEvent(appointment.clientId, 'payment_confirmed', {
        paymentId: payment.id,
        value: asNumber(payment.value)
      });
    }

    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findById(id);
    const status = dto.status ?? payment.status;

    const updated = await this.paymentsRepository.update(id, {
      ...dto,
      status
    });

    if (payment.status !== status && status === PaymentStatus.CONFIRMED) {
      const appointment = await this.appointmentsService.findById(payment.appointmentId);
      await this.funnelEventsService.recordEvent(appointment.clientId, 'payment_confirmed', {
        paymentId: payment.id,
        value: asNumber(updated.value)
      });
    }

    return updated;
  }

  async delete(id: string): Promise<Payment> {
    await this.findById(id);
    return this.paymentsRepository.delete(id);
  }

  async handleWebhook(dto: PaymentWebhookDto) {
    const payment = await this.paymentsRepository.findByPixTxid(dto.pixTxid);

    if (!payment) {
      throw new NotFoundException('Pagamento nao localizado para o webhook informado');
    }

    const updated = await this.paymentsRepository.update(payment.id, {
      status: dto.status ?? PaymentStatus.CONFIRMED
    });

    if (updated.status === PaymentStatus.CONFIRMED) {
      const appointment = await this.appointmentsService.findById(payment.appointmentId);

      await this.funnelEventsService.recordEvent(appointment.clientId, 'payment_confirmed', {
        paymentId: updated.id,
        value: asNumber(updated.value),
        pixTxid: payment.pixTxid
      });
    }

    return updated;
  }
}
