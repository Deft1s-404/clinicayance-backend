import { ClientsService } from '../clients/clients.service';
import { LeadsService } from '../leads/leads.service';
import { GoogleFormsPayloadDto } from './dto/google-forms.dto';
export declare class IntegrationsService {
    private readonly clientsService;
    private readonly leadsService;
    constructor(clientsService: ClientsService, leadsService: LeadsService);
    syncGoogleForms(payload: GoogleFormsPayloadDto): Promise<{
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
        lead: {
            id: string;
            clientId: string;
            createdAt: Date;
            updatedAt: Date;
            source: string | null;
            score: number;
            notes: string | null;
            stage: import(".prisma/client").$Enums.LeadStage;
        };
    }>;
}
