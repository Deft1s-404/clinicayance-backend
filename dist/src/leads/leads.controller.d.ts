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
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            source: string | null;
            tags: string[];
            score: number;
            status: import(".prisma/client").$Enums.ClientStatus;
            notes: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        score: number;
        notes: string | null;
        stage: import(".prisma/client").$Enums.LeadStage;
        clientId: string;
    }>;
    create(dto: CreateLeadDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        score: number;
        notes: string | null;
        stage: import(".prisma/client").$Enums.LeadStage;
        clientId: string;
    }>;
    update(id: string, dto: UpdateLeadDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        score: number;
        notes: string | null;
        stage: import(".prisma/client").$Enums.LeadStage;
        clientId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        score: number;
        notes: string | null;
        stage: import(".prisma/client").$Enums.LeadStage;
        clientId: string;
    }>;
}
