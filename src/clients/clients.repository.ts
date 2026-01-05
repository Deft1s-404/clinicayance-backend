import { Injectable } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface PaginatedClients {
  data: Client[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: PaginationQueryDto): Promise<PaginatedClients> {
    const { page = 1, limit = 20, search } = query;
    const where: Prisma.ClientWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } }
          ]
        }
      : undefined;

    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.client.count({ where })
    ]);

    return { data, total, page, limit };
  }

  findById(id: string): Promise<Client | null> {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        appointments: true,
        payments: true
      }
    });
  }

  findByEmail(email: string): Promise<Client | null> {
    return this.prisma.client.findFirst({ where: { email } });
  }

  findByPhone(phone: string): Promise<Client | null> {
    return this.prisma.client.findFirst({ where: { phone } });
  }

  create(data: Prisma.ClientCreateInput): Promise<Client> {
    return this.prisma.client.create({ data });
  }

  update(id: string, data: Prisma.ClientUpdateInput): Promise<Client> {
    return this.prisma.client.update({ where: { id }, data });
  }

  delete(id: string): Promise<Client> {
    return this.prisma.client.delete({ where: { id } });
  }
}
