import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ClientsService } from './clients.service';
import { PaginatedClients } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    list(query: PaginationQueryDto): Promise<PaginatedClients>;
    find(id: string): Promise<{
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
    }>;
    create(dto: CreateClientDto): Promise<{
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
    }>;
    update(id: string, dto: UpdateClientDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
