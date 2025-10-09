import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CampaignsService } from './campaigns.service';
import { PaginatedCampaigns } from './campaigns.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    list(query: PaginationQueryDto): Promise<PaginatedCampaigns>;
    find(id: string): Promise<{
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
    create(dto: CreateCampaignDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CampaignStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        channel: string;
        message: string;
        scheduledAt: Date | null;
    }>;
    update(id: string, dto: UpdateCampaignDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CampaignStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        channel: string;
        message: string;
        scheduledAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.CampaignStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        channel: string;
        message: string;
        scheduledAt: Date | null;
    }>;
    send(id: string): Promise<{
        campaignId: string;
        sentAt: Date;
        message: string;
    }>;
}
