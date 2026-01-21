import { Injectable } from '@nestjs/common';
import { Appointment, AppointmentStatus, Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface AppointmentQuery extends PaginationQueryDto {
  status?: AppointmentStatus;
  start?: string;
  end?: string;
}

export interface PaginatedAppointments {
  data: (Appointment & {
    client: {
      id: string;
      name: string;
      email: string | null;
    };
  })[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class AppointmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: AppointmentQuery): Promise<PaginatedAppointments> {
    const { page = 1, limit = 20, status, start, end, search } = query;
    const where: Prisma.AppointmentWhereInput = {
      ...(status ? { status } : {}),
      ...(start || end
        ? {
            start: start ? { gte: new Date(start) } : undefined,
            end: end ? { lte: new Date(end) } : undefined
          }
        : {}),
      ...(search
        ? {
            client: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
              ]
            }
          }
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
              email: true,
              phone: true
            }
          }
        },
        orderBy: { start: 'desc' }
      }),
      this.prisma.appointment.count({ where })
    ]);

    return { data, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        payments: true
      }
    });
  }

  create(data: Prisma.AppointmentCreateInput): Promise<Appointment> {
    return this.prisma.appointment.create({ data });
  }

  update(id: string, data: Prisma.AppointmentUpdateInput): Promise<Appointment> {
    return this.prisma.appointment.update({ where: { id }, data });
  }

  delete(id: string): Promise<Appointment> {
    return this.prisma.appointment.delete({ where: { id } });
  }
}
