import { AppointmentStatus } from '@prisma/client';
export declare class CreateAppointmentDto {
    clientId: string;
    procedure: string;
    start: string;
    end: string;
    status?: AppointmentStatus;
}
