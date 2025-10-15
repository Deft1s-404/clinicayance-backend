import { LeadStage } from '@prisma/client';
export declare class GoogleFormsPayloadDto {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    notes?: string;
    tags?: string[];
    stage?: LeadStage;
    age?: number;
    country?: string;
    birthDate?: string;
    language?: string;
    intimateAssessmentPhotos?: string[];
    anamnesisResponses?: Record<string, unknown>;
}
