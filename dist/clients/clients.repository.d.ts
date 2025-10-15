import { Client, Prisma } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
export interface PaginatedClients {
    data: Client[];
    total: number;
    page: number;
    limit: number;
}
export declare class ClientsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findMany(query: PaginationQueryDto): Promise<PaginatedClients>;
    findById(id: string): Promise<Client | null>;
    findByEmail(email: string): Promise<Client | null>;
    findByPhone(phone: string): Promise<Client | null>;
    create(data: Prisma.ClientCreateInput): Promise<Client>;
    update(id: string, data: Prisma.ClientUpdateInput): Promise<Client>;
    delete(id: string): Promise<Client>;
}
