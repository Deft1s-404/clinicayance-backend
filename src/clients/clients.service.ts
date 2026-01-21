import { Injectable, NotFoundException } from '@nestjs/common';
import { Client, ClientStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { calculateLeadScore } from '../common/utils/lead-scoring.util';
import { ClientsRepository, PaginatedClients } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

interface TreatmentImageEntry {
  id: string;
  url: string;
  uploadedAt: string;
}

const createImageEntry = (
  dataUrl: string,
  metadata?: Partial<Omit<TreatmentImageEntry, 'url'>>
): TreatmentImageEntry => ({
  id: metadata?.id ?? randomUUID(),
  url: dataUrl,
  uploadedAt: metadata?.uploadedAt ?? new Date().toISOString()
});

const normalizeImageEntries = (value: Prisma.JsonValue | null): TreatmentImageEntry[] => {
  if (!value) return [];

  const asArray = Array.isArray(value) ? value : [value];

  return asArray
    .map((item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        return createImageEntry(item);
      }
      if (Array.isArray(item)) {
        return null;
      }
      if (typeof item === 'object') {
        const record = item as Record<string, unknown>;
        if (typeof record.url === 'string') {
          return createImageEntry(record.url, {
            id: typeof record.id === 'string' ? record.id : undefined,
            uploadedAt: typeof record.uploadedAt === 'string' ? record.uploadedAt : undefined
          });
        }
        const entries: TreatmentImageEntry[] = [];
        if (typeof record.before === 'string') {
          entries.push(createImageEntry(record.before));
        }
        if (typeof record.after === 'string') {
          entries.push(createImageEntry(record.after));
        }
        if (entries.length > 0) {
          return entries;
        }
      }
      return null;
    })
    .flatMap((entry) => {
      if (!entry) return [];
      return Array.isArray(entry) ? entry : [entry];
    });
};

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

    const createData: Prisma.ClientCreateInput = {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      address: dto.address ?? undefined,
      source: dto.source,
      tags: dto.tags ?? [],
      notes: dto.notes,
      status: dto.status ?? ClientStatus.NEW,
      score,
      age: dto.age ?? undefined,
      country: dto.country ?? undefined,
      birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      language: dto.language ?? undefined,
      anamnesisResponses: dto.anamnesisResponses as Prisma.InputJsonValue | undefined
    };

    if (dto.treatmentImage) {
      const images = [createImageEntry(dto.treatmentImage)];
      createData.beforeAfterPhotos = images as unknown as Prisma.InputJsonValue;
    }

    return this.clientsRepository.create(createData);
  }

  async update(id: string, dto: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id);

    const score = calculateLeadScore({
      source: dto.source ?? client.source ?? undefined,
      tags: dto.tags ?? client.tags,
      status: dto.status ?? client.status
    });

    const updateData: Prisma.ClientUpdateInput = {
      tags: dto.tags ?? client.tags,
      score
    };

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.address !== undefined) updateData.address = dto.address;
    if (dto.source !== undefined) updateData.source = dto.source;
    if (dto.notes !== undefined) updateData.notes = dto.notes;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.age !== undefined) updateData.age = dto.age;
    if (dto.country !== undefined) updateData.country = dto.country;
    if (dto.birthDate !== undefined)
      updateData.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
    if (dto.language !== undefined) updateData.language = dto.language;
    if (dto.anamnesisResponses !== undefined)
      updateData.anamnesisResponses = dto.anamnesisResponses as Prisma.InputJsonValue;
    if (dto.treatmentImage) {
      const existingImages = normalizeImageEntries(client.beforeAfterPhotos as Prisma.JsonValue | null);
      updateData.beforeAfterPhotos = [...existingImages, createImageEntry(dto.treatmentImage)] as unknown as Prisma.InputJsonValue;
    }

    return this.clientsRepository.update(id, updateData);
  }

  async delete(id: string): Promise<Client> {
    await this.findById(id);
    return this.clientsRepository.delete(id);
  }

  updateScore(id: string, score: number): Promise<Client> {
    return this.clientsRepository.update(id, { score });
  }
}
