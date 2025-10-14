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
            anamnesisResponses: Prisma.JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
        appointment: {
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
                anamnesisResponses: Prisma.JsonValue | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.AppointmentStatus;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            procedure: string;
            start: Date;
            end: Date;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        appointmentId: string;
        value: Prisma.Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
    }>;
    create(dto: CreatePaymentDto): Promise<Payment>;
    update(id: string, dto: UpdatePaymentDto): Promise<Payment>;
    delete(id: string): Promise<Payment>;
    handleWebhook(dto: PaymentWebhookDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        appointmentId: string;
        value: Prisma.Decimal;
        method: string;
        pixTxid: string | null;
        comprovanteUrl: string | null;
    }>;
}
