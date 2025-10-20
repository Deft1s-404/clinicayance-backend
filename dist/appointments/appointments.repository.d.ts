import { Appointment, AppointmentStatus, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
export interface AppointmentQuery extends PaginationQueryDto {
    status?: AppointmentStatus;
    start?: string;
    end?: string;
}
export interface PaginatedAppointments {
    data: (Appointment & {
        client: {
            id: string;
            name: string;
            email: string | null;
        };
    })[];
    total: number;
    page: number;
    limit: number;
}
export declare class AppointmentsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(query: AppointmentQuery): Promise<PaginatedAppointments>;
    findById(id: string): Prisma.Prisma__AppointmentClient<({
        payments: {
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.AppointmentCreateInput): Promise<Appointment>;
    update(id: string, data: Prisma.AppointmentUpdateInput): Promise<Appointment>;
    delete(id: string): Promise<Appointment>;
}
