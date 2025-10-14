import { LeadStage } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PaginatedLeads } from './leads.repository';
import { LeadsService } from './leads.service';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    list(query: PaginationQueryDto, stage?: LeadStage): Promise<PaginatedLeads>;
    find(id: string): Promise<{
        client: {
            name: string;
            id: string;
            email: string | null;
            phone: string | null;
            source: string | null;
            tags: string[];
            score: number;
            status: import(".prisma/client").$Enums.ClientStatus;
            notes: string | null;
            age: number | null;
            country: string | null;
            birthDate: Date | null;
            language: string | null;
            intimateAssessmentPhotos: string[];
            anamnesisResponses: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        source: string | null;
        score: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        stage: import(".prisma/client").$Enums.LeadStage;
    }>;
    create(dto: CreateLeadDto): Promise<{
        id: string;
        source: string | null;
        score: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        stage: import(".prisma/client").$Enums.LeadStage;
    }>;
    update(id: string, dto: UpdateLeadDto): Promise<{
        id: string;
        source: string | null;
        score: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        stage: import(".prisma/client").$Enums.LeadStage;
    }>;
    remove(id: string): Promise<{
        id: string;
        source: string | null;
        score: number;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        stage: import(".prisma/client").$Enums.LeadStage;
    }>;
}
