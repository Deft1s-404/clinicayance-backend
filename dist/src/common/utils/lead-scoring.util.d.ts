import { ClientStatus, LeadStage } from '@prisma/client';
interface ScoreInput {
    source?: string | null;
    tags?: string[];
    status?: ClientStatus;
    stage?: LeadStage;
}
export declare const calculateLeadScore: (input: ScoreInput) => number;
export {};
