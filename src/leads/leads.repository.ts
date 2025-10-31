import { Injectable } from '@nestjs/common';
import { Lead, LeadStage, Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface LeadsQuery extends PaginationQueryDto {
  stage?: LeadStage;
  source?: 'instagram' | 'facebook' | 'indicacao' | 'site' | 'whatsapp';
}

export interface PaginatedLeads {
  data: (Lead & { client: { id: string; name: string; email: string | null; phone: string | null } })[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: LeadsQuery): Promise<PaginatedLeads> {
    const { page = 1, limit = 20, search, stage, source } = query;

    const mapSource = (s: LeadsQuery['source']): string | undefined => {
      switch (s) {
        case 'instagram':
          return 'Instagram';
        case 'facebook':
          return 'Facebook';
        case 'indicacao':
          return 'Indicacao';
        case 'site':
          return 'Site';
        case 'whatsapp':
          return 'WhatsApp';
        default:
          return undefined;
      }
    };

    const sourceEquals = source ? mapSource(source) : undefined;

    const where: Prisma.LeadWhereInput = {
      ...(stage ? { stage } : {}),
      ...(sourceEquals ? { source: { equals: sourceEquals, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { source: { contains: search, mode: 'insensitive' } },
              { client: { name: { contains: search, mode: 'insensitive' } } }
            ]
          }
        : {})
    };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
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
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.lead.count({ where })
    ]);

    return { data, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { client: true }
    });
  }

  create(data: Prisma.LeadCreateInput): Promise<Lead> {
    return this.prisma.lead.create({ data });
  }

  update(id: string, data: Prisma.LeadUpdateInput): Promise<Lead> {
    return this.prisma.lead.update({ where: { id }, data });
  }

  delete(id: string): Promise<Lead> {
    return this.prisma.lead.delete({ where: { id } });
  }

  async exportMany(
    query: LeadsQuery
  ): Promise<(Lead & { client: { id: string; name: string; email: string | null; phone: string | null } })[]> {
    const { search, stage, source } = query;

    const mapSource = (s: LeadsQuery['source']): string | undefined => {
      switch (s) {
        case 'instagram':
          return 'Instagram';
        case 'facebook':
          return 'Facebook';
        case 'indicacao':
          return 'Indicacao';
        case 'site':
          return 'Site';
        case 'whatsapp':
          return 'WhatsApp';
        default:
          return undefined;
      }
    };

    const sourceEquals = source ? mapSource(source) : undefined;

    const where: Prisma.LeadWhereInput = {
      ...(stage ? { stage } : {}),
      ...(sourceEquals ? { source: { equals: sourceEquals, mode: 'insensitive' } } : {}),
      ...(search
        ? {
            OR: [
              { source: { contains: search, mode: 'insensitive' } },
              { client: { name: { contains: search, mode: 'insensitive' } } }
            ]
          }
        : {})
    };

    return this.prisma.lead.findMany({
      where,
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
      orderBy: { createdAt: 'desc' }
    });
  }
}
