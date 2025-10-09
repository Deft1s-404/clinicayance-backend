import { Injectable } from '@nestjs/common';
import { Campaign, Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface PaginatedCampaigns {
  data: (Campaign & { logs: { id: string; message: string; createdAt: Date }[] })[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class CampaignsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: PaginationQueryDto): Promise<PaginatedCampaigns> {
    const { page = 1, limit = 20, search } = query;
    const where: Prisma.CampaignWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { channel: { contains: search, mode: 'insensitive' } }
          ]
        }
      : undefined;

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          logs: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.campaign.count({ where })
    ]);

    return { data, total, page, limit };
  }

  findById(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: { logs: { orderBy: { createdAt: 'desc' } } }
    });
  }

  create(data: Prisma.CampaignCreateInput): Promise<Campaign> {
    return this.prisma.campaign.create({ data });
  }

  update(id: string, data: Prisma.CampaignUpdateInput): Promise<Campaign> {
    return this.prisma.campaign.update({ where: { id }, data });
  }

  delete(id: string): Promise<Campaign> {
    return this.prisma.campaign.delete({ where: { id } });
  }

  createLog(campaignId: string, message: string) {
    return this.prisma.campaignLog.create({
      data: { campaignId, message }
    });
  }
}
