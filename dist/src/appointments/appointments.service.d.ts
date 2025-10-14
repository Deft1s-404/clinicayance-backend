import { Appointment } from '@prisma/client';
import { ClientsService } from '../clients/clients.service';
import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import { AppointmentQuery, AppointmentsRepository, PaginatedAppointments } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsService {
    private readonly appointmentsRepository;
    private readonly clientsService;
    private readonly funnelEventsService;
    constructor(appointmentsRepository: AppointmentsRepository, clientsService: ClientsService, funnelEventsService: FunnelEventsService);
    list(query: AppointmentQuery): Promise<PaginatedAppointments>;
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
            anamnesisResponses: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        };
        payments: {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            appointmentId: string;
            value: import("@prisma/client/runtime/library").Decimal;
            method: string;
            pixTxid: string | null;
            comprovanteUrl: string | null;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        procedure: string;
        start: Date;
        end: Date;
    }>;
    create(dto: CreateAppointmentDto): Promise<Appointment>;
    update(id: string, dto: UpdateAppointmentDto): Promise<Appointment>;
    delete(id: string): Promise<Appointment>;
}
