import { Lead, LeadStage, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
export interface LeadsQuery extends PaginationQueryDto {
    stage?: LeadStage;
}
export interface PaginatedLeads {
    data: (Lead & {
        client: {
            id: string;
            name: string;
            email: string | null;
        };
    })[];
    total: number;
    page: number;
    limit: number;
}
export declare class LeadsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(query: LeadsQuery): Promise<PaginatedLeads>;
    findById(id: string): Prisma.Prisma__LeadClient<({
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
            anamnesisResponses: Prisma.JsonValue | null;
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.LeadCreateInput): Promise<Lead>;
    update(id: string, data: Prisma.LeadUpdateInput): Promise<Lead>;
    delete(id: string): Promise<Lead>;
}
