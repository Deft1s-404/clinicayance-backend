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
            age: number | null;
            country: string | null;
            birthDate: Date | null;
            language: string | null;
            intimateAssessmentPhotos: string[];
            anamnesisResponses: import("@prisma/client/runtime/library").JsonValue | null;
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
        anamnesisRecord: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            email: string | null;
            phone: string | null;
            age: number | null;
            country: string | null;
            birthDate: Date | null;
            language: string | null;
            previousAestheticTreatment: boolean | null;
            originalResponses: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
}
