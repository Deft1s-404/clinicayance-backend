import { Injectable } from '@nestjs/common';
import { Payment, PaymentStatus, Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface PaymentsQuery extends PaginationQueryDto {
  status?: PaymentStatus;
}

export interface PaginatedPayments {
  data: (Payment & {
    appointment: {
      id: string;
      procedure: string;
      client: {
        id: string;
        name: string;
      };
    };
    client: {
      id: string;
      name: string;
    };
  })[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: PaymentsQuery): Promise<PaginatedPayments> {
    const { page = 1, limit = 20, status, search } = query;

    const where: Prisma.PaymentWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { method: { contains: search, mode: 'insensitive' } },
              { appointment: { client: { name: { contains: search, mode: 'insensitive' } } } },
              { client: { name: { contains: search, mode: 'insensitive' } } }
            ]
          }
        : {})
    };

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          appointment: {
            select: {
              id: true,
              procedure: true,
              client: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          client: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.payment.count({ where })
    ]);

    return { data, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            client: true
          }
        },
        client: true
      }
    });
  }

  findByPixTxid(pixTxid: string) {
    return this.prisma.payment.findFirst({
      where: { pixTxid }
    });
  }

  create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data });
  }

  delete(id: string): Promise<Payment> {
    return this.prisma.payment.delete({ where: { id } });
  }
}
