import { Payment, PaymentStatus, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
export interface PaymentsQuery extends PaginationQueryDto {
    status?: PaymentStatus;
}
export interface PaginatedPayments {
    data: (Payment & {
        appointment: {
            id: string;
            procedure: string;
            client: {
                id: string;
                name: string;
            };
        };
        client: {
            id: string;
            name: string;
        };
    })[];
    total: number;
    page: number;
    limit: number;
}
export declare class PaymentsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(query: PaymentsQuery): Promise<PaginatedPayments>;
    findById(id: string): Prisma.Prisma__PaymentClient<({
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
        appointment: {
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
            procedure: string;
            start: Date;
            end: Date;
            status: import(".prisma/client").$Enums.AppointmentStatus;
            googleEventId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        clientId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        appointmentId: string;
        value: Prisma.Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByPixTxid(pixTxid: string): Prisma.Prisma__PaymentClient<{
        id: string;
        clientId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        appointmentId: string;
        value: Prisma.Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.PaymentCreateInput): Promise<Payment>;
    update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment>;
    delete(id: string): Promise<Payment>;
}
