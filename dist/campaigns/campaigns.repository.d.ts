import { Campaign, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
export interface PaginatedCampaigns {
    data: (Campaign & {
        logs: {
            id: string;
            message: string;
            createdAt: Date;
        }[];
    })[];
    total: number;
    page: number;
    limit: number;
}
export declare class CampaignsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(query: PaginationQueryDto): Promise<PaginatedCampaigns>;
    findById(id: string): Prisma.Prisma__CampaignClient<({
        logs: {
            id: string;
            createdAt: Date;
            message: string;
            campaignId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        channel: string;
        message: string;
        scheduledAt: Date | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.CampaignCreateInput): Promise<Campaign>;
    update(id: string, data: Prisma.CampaignUpdateInput): Promise<Campaign>;
    delete(id: string): Promise<Campaign>;
    createLog(campaignId: string, message: string): Prisma.Prisma__CampaignLogClient<{
        id: string;
        createdAt: Date;
        message: string;
        campaignId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
