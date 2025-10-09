import { GoogleFormsPayloadDto } from './dto/google-forms.dto';
import { IntegrationsService } from './integrations.service';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    syncGoogleForms(dto: GoogleFormsPayloadDto): Promise<{
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
