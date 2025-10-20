import { AppointmentStatus } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
export declare class ListAppointmentsDto extends PaginationQueryDto {
    status?: AppointmentStatus;
    start?: string;
    end?: string;
}
