import { ClientStatus } from '@prisma/client';
export declare class CreateClientDto {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    tags?: string[];
    status?: ClientStatus;
    notes?: string;
}
