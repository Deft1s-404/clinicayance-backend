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
    create(dto: CreateLeadDto): Promise<Lead>;
    update(id: string, dto: UpdateLeadDto): Promise<Lead>;
    delete(id: string): Promise<Lead>;
}
