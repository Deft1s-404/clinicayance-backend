import { GoogleFormsPayloadDto } from './dto/google-forms.dto';
import { IntegrationsService } from './integrations.service';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    syncGoogleForms(dto: GoogleFormsPayloadDto): Promise<{
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
