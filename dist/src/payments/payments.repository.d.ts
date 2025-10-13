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
            anamnesisResponses: Prisma.JsonValue | null;
        };
        appointment: {
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
                anamnesisResponses: Prisma.JsonValue | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AppointmentStatus;
            clientId: string;
            procedure: string;
            start: Date;
            end: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        clientId: string;
        value: Prisma.Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        appointmentId: string;
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    findByPixTxid(pixTxid: string): Prisma.Prisma__PaymentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        clientId: string;
        value: Prisma.Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        appointmentId: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.PaymentCreateInput): Promise<Payment>;
    update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment>;
    delete(id: string): Promise<Payment>;
}
