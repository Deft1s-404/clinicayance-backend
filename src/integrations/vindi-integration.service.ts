import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export type VindiIntegrationStatus = {
  connected: boolean;
  connectedAt: string | null;
  lastFour: string | null;
  connectedBy: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};

@Injectable()
export class VindiIntegrationService {
  private readonly singletonId = 'vindi';

  constructor(private readonly prisma: PrismaService) {}

  async getStatus(): Promise<VindiIntegrationStatus> {
    const record = await this.prisma.vindiIntegration.findUnique({
      where: { id: this.singletonId },
      include: {
        connectedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!record) {
      return {
        connected: false,
        connectedAt: null,
        lastFour: null,
        connectedBy: null
      };
    }

    return {
      connected: true,
      connectedAt: (record.connectedAt ?? record.updatedAt)?.toISOString() ?? null,
      lastFour: this.extractLastFour(record.apiKey),
      connectedBy: record.connectedByUser
        ? {
            id: record.connectedByUser.id,
            name: record.connectedByUser.name,
            email: record.connectedByUser.email
          }
        : null
    };
  }

  async saveApiKey(userId: string, apiKey: string): Promise<VindiIntegrationStatus> {
    const sanitizedKey = apiKey.trim();

    if (!sanitizedKey) {
      throw new BadRequestException('API key da Vindi nao pode ser vazia.');
    }

    const timestamp = new Date();

    await this.prisma.vindiIntegration.upsert({
      where: { id: this.singletonId },
      create: {
        id: this.singletonId,
        apiKey: sanitizedKey,
        connectedByUserId: userId,
        connectedAt: timestamp
      },
      update: {
        apiKey: sanitizedKey,
        connectedByUserId: userId,
        connectedAt: timestamp
      }
    });

    return this.getStatus();
  }

  private extractLastFour(value: string | null): string | null {
    if (!value) {
      return null;
    }

    return value.length <= 4 ? value : value.slice(-4);
  }
}
