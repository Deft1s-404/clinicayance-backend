import { LeadStage } from '@prisma/client';
export declare class GoogleFormsPayloadDto {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    notes?: string;
    tags?: string[];
    stage?: LeadStage;
}
