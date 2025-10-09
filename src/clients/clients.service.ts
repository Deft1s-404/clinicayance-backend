import { Injectable, NotFoundException } from '@nestjs/common';
import { Client, ClientStatus } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { calculateLeadScore } from '../common/utils/lead-scoring.util';
import { ClientsRepository, PaginatedClients } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  list(query: PaginationQueryDto): Promise<PaginatedClients> {
    return this.clientsRepository.findMany(query);
  }

  async findById(id: string): Promise<Client> {
    const client = await this.clientsRepository.findById(id);

    if (!client) {
      throw new NotFoundException('Cliente nao encontrado');
    }

    return client;
  }

  findByEmail(email: string) {
    return this.clientsRepository.findByEmail(email);
  }

  findByPhone(phone: string) {
    return this.clientsRepository.findByPhone(phone);
  }

  async create(dto: CreateClientDto): Promise<Client> {
    const score = calculateLeadScore({
      source: dto.source,
      tags: dto.tags ?? [],
      status: dto.status ?? ClientStatus.NEW
    });

    return this.clientsRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      source: dto.source,
      tags: dto.tags ?? [],
      notes: dto.notes,
      status: dto.status ?? ClientStatus.NEW,
      score
    });
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id);

    const score = calculateLeadScore({
      source: dto.source ?? client.source ?? undefined,
      tags: dto.tags ?? client.tags,
      status: dto.status ?? client.status
    });

    return this.clientsRepository.update(id, {
      ...dto,
      tags: dto.tags ?? client.tags,
      score
    });
  }

  async delete(id: string): Promise<Client> {
    await this.findById(id);
    return this.clientsRepository.delete(id);
  }

  updateScore(id: string, score: number): Promise<Client> {
    return this.clientsRepository.update(id, { score });
  }
}
