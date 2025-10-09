import { Client } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ClientsRepository, PaginatedClients } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsService {
    private readonly clientsRepository;
    constructor(clientsRepository: ClientsRepository);
    list(query: PaginationQueryDto): Promise<PaginatedClients>;
    findById(id: string): Promise<Client>;
    findByEmail(email: string): Promise<{
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
    } | null>;
    findByPhone(phone: string): Promise<{
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
    } | null>;
    create(dto: CreateClientDto): Promise<Client>;
    update(id: string, dto: UpdateClientDto): Promise<Client>;
    delete(id: string): Promise<Client>;
    updateScore(id: string, score: number): Promise<Client>;
}
