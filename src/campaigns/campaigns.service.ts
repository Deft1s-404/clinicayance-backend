import { Injectable, NotFoundException } from '@nestjs/common';
import { Campaign, CampaignStatus } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CampaignsRepository, PaginatedCampaigns } from './campaigns.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly campaignsRepository: CampaignsRepository) {}

  list(query: PaginationQueryDto): Promise<PaginatedCampaigns> {
    return this.campaignsRepository.findMany(query);
  }

  async findById(id: string) {
    const campaign = await this.campaignsRepository.findById(id);

    if (!campaign) {
      throw new NotFoundException('Campanha nao encontrada');
    }

    return campaign;
  }

  create(dto: CreateCampaignDto): Promise<Campaign> {
    return this.campaignsRepository.create({
      name: dto.name,
      channel: dto.channel,
      message: dto.message,
      status: dto.status ?? CampaignStatus.DRAFT,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined
    });
  }

  async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    await this.findById(id);

    return this.campaignsRepository.update(id, {
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined
    });
  }

  async delete(id: string): Promise<Campaign> {
    await this.findById(id);
    return this.campaignsRepository.delete(id);
  }

  async send(id: string) {
    const campaign = await this.findById(id);
    const sentAt = new Date();
    const status =
      campaign.status === CampaignStatus.COMPLETED ? CampaignStatus.COMPLETED : CampaignStatus.ACTIVE;

    await this.campaignsRepository.update(id, {
      status,
      scheduledAt: campaign.scheduledAt ?? sentAt
    });

    const message = `Campanha enviada via ${campaign.channel} em ${sentAt.toISOString()}`;
    await this.campaignsRepository.createLog(id, message);

    return {
      campaignId: id,
      sentAt,
      message
    };
  }
}
