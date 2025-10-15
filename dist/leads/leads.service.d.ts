import { Lead } from '@prisma/client';
import { ClientsService } from '../clients/clients.service';
import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsQuery, LeadsRepository, PaginatedLeads } from './leads.repository';
export declare class LeadsService {
    private readonly leadsRepository;
    private readonly clientsService;
    private readonly funnelEventsService;
    constructor(leadsRepository: LeadsRepository, clientsService: ClientsService, funnelEventsService: FunnelEventsService);
    list(query: LeadsQuery): Promise<PaginatedLeads>;
    findById(id: string): Promise<{
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
            age: number | null;
            country: string | null;
            birthDate: Date | null;
            language: string | null;
            intimateAssessmentPhotos: string[];
            anamnesisResponses: import("@prisma/client/runtime/library").JsonValue | null;
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
    create(dto: CreateLeadDto): Promise<Lead>;
    update(id: string, dto: UpdateLeadDto): Promise<Lead>;
    delete(id: string): Promise<Lead>;
}
