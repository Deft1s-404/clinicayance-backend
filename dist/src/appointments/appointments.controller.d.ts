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
    create(dto: CreateAppointmentDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        procedure: string;
        start: Date;
        end: Date;
    }>;
    update(id: string, dto: UpdateAppointmentDto): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        procedure: string;
        start: Date;
        end: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.AppointmentStatus;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
        procedure: string;
        start: Date;
        end: Date;
    }>;
}
