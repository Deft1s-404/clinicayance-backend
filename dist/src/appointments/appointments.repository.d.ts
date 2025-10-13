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
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            clientId: string;
            value: Prisma.Decimal;
            method: string;
            pixTxid: string | null;
            comprovanteUrl: string | null;
            appointmentId: string;
        }[];
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
    }) | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(data: Prisma.AppointmentCreateInput): Promise<Appointment>;
    update(id: string, data: Prisma.AppointmentUpdateInput): Promise<Appointment>;
    delete(id: string): Promise<Appointment>;
}
