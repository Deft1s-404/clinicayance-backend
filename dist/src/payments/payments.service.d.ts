import { Payment, Prisma } from '@prisma/client';
import { AppointmentsService } from '../appointments/appointments.service';
import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaginatedPayments, PaymentsQuery, PaymentsRepository } from './payments.repository';
export declare class PaymentsService {
    private readonly paymentsRepository;
    private readonly appointmentsService;
    private readonly funnelEventsService;
    constructor(paymentsRepository: PaymentsRepository, appointmentsService: AppointmentsService, funnelEventsService: FunnelEventsService);
    list(query: PaymentsQuery): Promise<PaginatedPayments>;
    findById(id: string): Promise<{
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
    }>;
    create(dto: CreatePaymentDto): Promise<Payment>;
    update(id: string, dto: UpdatePaymentDto): Promise<Payment>;
    delete(id: string): Promise<Payment>;
    handleWebhook(dto: PaymentWebhookDto): Promise<{
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
    }>;
}
