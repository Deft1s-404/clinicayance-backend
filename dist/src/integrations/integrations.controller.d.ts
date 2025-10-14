import { GoogleFormsPayloadDto } from './dto/google-forms.dto';
import { IntegrationsService } from './integrations.service';
export declare class IntegrationsController {
    private readonly integrationsService;
    constructor(integrationsService: IntegrationsService);
    syncGoogleForms(dto: GoogleFormsPayloadDto): Promise<{
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
        lead: {
            id: string;
            source: string | null;
            score: number;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            stage: import(".prisma/client").$Enums.LeadStage;
        };
        anamnesisRecord: {
            name: string;
            id: string;
            email: string | null;
            phone: string | null;
            age: number | null;
            country: string | null;
            birthDate: Date | null;
            language: string | null;
            createdAt: Date;
            updatedAt: Date;
            previousAestheticTreatment: boolean | null;
            originalResponses: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
}
