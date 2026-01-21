import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { ListServiceOfferingsDto } from './dto/list-service-offerings.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListServiceOfferingsDto) {
    const { page = 1, limit = 20, country, category, onlyActive, minPrice, maxPrice, search } =
      query;

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw new BadRequestException('minPrice cannot be greater than maxPrice.');
    }

    const where: Prisma.ServiceOfferingWhereInput = {
      ...(country ? { country: { equals: country, mode: 'insensitive' } } : {}),
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(onlyActive ? { active: true } : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {})
            }
          }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { notes: { contains: search, mode: 'insensitive' } },
              { country: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {})
    };

    const [data, total] = await Promise.all([
      this.prisma.serviceOffering.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ country: 'asc' }, { name: 'asc' }]
      }),
      this.prisma.serviceOffering.count({ where })
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    const service = await this.prisma.serviceOffering.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Serviço ${id} não encontrado.`);
    }
    return service;
  }

  create(dto: CreateServiceOfferingDto) {
    return this.prisma.serviceOffering.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        country: dto.country,
        currency: dto.currency ?? 'USD',
        price: new Prisma.Decimal(dto.price),
        durationMinutes: dto.durationMinutes,
        notes: dto.notes,
        active: dto.active ?? true
      }
    });
  }

  async update(id: string, dto: UpdateServiceOfferingDto) {
    await this.findById(id);
    return this.prisma.serviceOffering.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.country !== undefined ? { country: dto.country } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.price !== undefined ? { price: new Prisma.Decimal(dto.price) } : {}),
        ...(dto.durationMinutes !== undefined ? { durationMinutes: dto.durationMinutes } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.active !== undefined ? { active: dto.active } : {})
      }
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.serviceOffering.delete({ where: { id } });
  }
}
