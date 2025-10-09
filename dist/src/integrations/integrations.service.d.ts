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
        lead: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            source: string | null;
            score: number;
            notes: string | null;
            stage: import(".prisma/client").$Enums.LeadStage;
            clientId: string;
        };
    }>;
}
