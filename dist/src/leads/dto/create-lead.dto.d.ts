import { LeadStage } from '@prisma/client';
export declare class CreateLeadDto {
    clientId: string;
    source?: string;
    notes?: string;
    stage?: LeadStage;
}
