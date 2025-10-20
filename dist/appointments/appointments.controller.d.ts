import { AppointmentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AppointmentsService } from './appointments.service';
import { PaginatedAppointments } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    list(query: PaginationQueryDto, status?: AppointmentStatus, start?: string, end?: string): Promise<PaginatedAppointments>;
    find(id: string): Promise<{
        payments: {
            id: string;
            clientId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            appointmentId: string;
            value: import("@prisma/client/runtime/library").Decimal;
            method: string;
            pixTxid: string | null;
            comprovanteUrl: string | null;
        }[];
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
            anamnesisResponses: import("@prisma/client/runtime/library").JsonValue | null;
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
    }>;
    create(dto: CreateAppointmentDto): Promise<{
        id: string;
        clientId: string;
        procedure: string;
        start: Date;
        end: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        googleEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateAppointmentDto): Promise<{
        id: string;
        clientId: string;
        procedure: string;
        start: Date;
        end: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        googleEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        clientId: string;
        procedure: string;
        start: Date;
        end: Date;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        googleEventId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
