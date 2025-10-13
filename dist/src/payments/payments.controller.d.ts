import { PaymentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaginatedPayments } from './payments.repository';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    list(query: PaginationQueryDto, status?: PaymentStatus): Promise<PaginatedPayments>;
    find(id: string): Promise<{
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
            anamnesisResponses: import("@prisma/client/runtime/library").JsonValue | null;
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
                anamnesisResponses: import("@prisma/client/runtime/library").JsonValue | null;
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
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        appointmentId: string;
    }>;
    create(dto: CreatePaymentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        appointmentId: string;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        appointmentId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        appointmentId: string;
    }>;
    webhook(dto: PaymentWebhookDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        appointmentId: string;
    }>;
}
