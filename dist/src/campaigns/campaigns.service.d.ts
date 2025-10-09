import { Campaign } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CampaignsRepository, PaginatedCampaigns } from './campaigns.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
export declare class CampaignsService {
    private readonly campaignsRepository;
    constructor(campaignsRepository: CampaignsRepository);
    list(query: PaginationQueryDto): Promise<PaginatedCampaigns>;
    findById(id: string): Promise<{
        logs: {
            id: string;
            createdAt: Date;
            message: string;
            campaignId: string;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.CampaignStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        channel: string;
        message: string;
        scheduledAt: Date | null;
    }>;
    create(dto: CreateCampaignDto): Promise<Campaign>;
    update(id: string, dto: UpdateCampaignDto): Promise<Campaign>;
    delete(id: string): Promise<Campaign>;
    send(id: string): Promise<{
        campaignId: string;
        sentAt: Date;
        message: string;
    }>;
}
