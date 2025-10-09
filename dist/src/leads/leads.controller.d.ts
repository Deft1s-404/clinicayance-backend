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
            id: string;
            status: import(".prisma/client").$Enums.ClientStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string | null;
            phone: string | null;
            source: string | null;
            tags: string[];
            score: number;
            notes: string | null;
        };
    } & {
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        score: number;
        notes: string | null;
        stage: import(".prisma/client").$Enums.LeadStage;
    }>;
    create(dto: CreateLeadDto): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        score: number;
        notes: string | null;
        stage: import(".prisma/client").$Enums.LeadStage;
    }>;
    update(id: string, dto: UpdateLeadDto): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        score: number;
        notes: string | null;
        stage: import(".prisma/client").$Enums.LeadStage;
    }>;
    remove(id: string): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        score: number;
        notes: string | null;
        stage: import(".prisma/client").$Enums.LeadStage;
    }>;
}
