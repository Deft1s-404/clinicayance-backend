import { CampaignStatus } from '@prisma/client';
export declare class CreateCampaignDto {
    name: string;
    channel: string;
    message: string;
    status?: CampaignStatus;
    scheduledAt?: string;
}
