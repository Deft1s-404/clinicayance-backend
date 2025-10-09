import { Injectable } from '@nestjs/common';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';
import dayjs from 'dayjs';

import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import { PrismaService } from '../prisma/prisma.service';

interface DateRange {
  start?: string;
  end?: string;
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly funnelEventsService: FunnelEventsService
  ) {}

  async funnel() {
    const counts = await this.funnelEventsService.countByType([
      'lead_created',
      'lead_qualified',
      'appointment_booked',
      'appointment_completed',
      'payment_confirmed'
    ]);

    const conversionRate =
      counts.lead_created && counts.payment_confirmed
        ? Number(((counts.payment_confirmed / counts.lead_created) * 100).toFixed(2))
        : 0;

    return {
      counts,
      conversionRate
    };
  }

  async revenue(period: 'day' | 'month', range: DateRange) {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.CONFIRMED,
        createdAt: {
          gte: range.start ? new Date(range.start) : undefined,
          lte: range.end ? new Date(range.end) : undefined
        }
      }
    });

    const grouped = payments.reduce<Record<string, number>>((acc, payment) => {
      const key =
        period === 'month'
          ? dayjs(payment.createdAt).format('YYYY-MM')
          : dayjs(payment.createdAt).format('YYYY-MM-DD');

      acc[key] = (acc[key] ?? 0) + Number(payment.value);
      return acc;
    }, {});

    const series = Object.entries(grouped)
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => (a.label > b.label ? 1 : -1));

    const total = series.reduce((sum, item) => sum + item.total, 0);

    return { total, series };
  }

  async appointments(range: DateRange) {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        start: range.start ? { gte: new Date(range.start) } : undefined,
        end: range.end ? { lte: new Date(range.end) } : undefined
      }
    });

    const byStatus = Object.values(AppointmentStatus).reduce<Record<string, number>>(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {}
    );

    appointments.forEach((appointment) => {
      byStatus[appointment.status] = (byStatus[appointment.status] ?? 0) + 1;
    });

    const byWeek = appointments.reduce<Record<string, number>>((acc, appointment) => {
      const week = dayjs(appointment.start).format('YYYY-[W]WW');
      acc[week] = (acc[week] ?? 0) + 1;
      return acc;
    }, {});

    return {
      byStatus,
      byWeek: Object.entries(byWeek)
        .map(([label, total]) => ({ label, total }))
        .sort((a, b) => (a.label > b.label ? 1 : -1))
    };
  }
}
