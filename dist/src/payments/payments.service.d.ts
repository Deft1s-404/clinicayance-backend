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
        value: Prisma.Decimal;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreatePaymentDto): Promise<Payment>;
    update(id: string, dto: UpdatePaymentDto): Promise<Payment>;
    delete(id: string): Promise<Payment>;
    handleWebhook(dto: PaymentWebhookDto): Promise<{
        id: string;
        appointmentId: string;
        clientId: string;
        value: Prisma.Decimal;
        method: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        pixTxid: string | null;
        comprovanteUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
