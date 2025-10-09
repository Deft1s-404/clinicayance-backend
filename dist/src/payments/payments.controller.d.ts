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
            };
        } & {
            id: string;
            clientId: string;
            status: import(".prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            procedure: string;
            start: Date;
            end: Date;
        };
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
    } & {
        id: string;
        appointmentId: string;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreatePaymentDto): Promise<{
        id: string;
        appointmentId: string;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdatePaymentDto): Promise<{
        id: string;
        appointmentId: string;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        appointmentId: string;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    webhook(dto: PaymentWebhookDto): Promise<{
        id: string;
        appointmentId: string;
        clientId: string;
        value: import("@prisma/client/runtime/library").Decimal;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
