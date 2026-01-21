import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { ListWaitlistDto } from './dto/list-waitlist.dto';
import { UpdateWaitlistEntryDto } from './dto/update-waitlist-entry.dto';

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListWaitlistDto) {
    const { page = 1, limit = 20, search, country, desiredCourse } = query;
    const where: Prisma.WaitlistEntryWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { desiredCourse: { contains: search, mode: 'insensitive' } },
              { country: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(country ? { country: { contains: country, mode: 'insensitive' } } : {}),
      ...(desiredCourse
        ? { desiredCourse: { contains: desiredCourse, mode: 'insensitive' } }
        : {})
    };

    const [data, total] = await Promise.all([
      this.prisma.waitlistEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.waitlistEntry.count({ where })
    ]);

    return { data, total, page, limit };
  }

  create(dto: CreateWaitlistEntryDto) {
    return this.prisma.waitlistEntry.create({
      data: {
        name: dto.name ?? undefined,
        email: dto.email ?? undefined,
        phone: dto.phone ?? undefined,
        desiredCourse: dto.desiredCourse ?? undefined,
        country: dto.country ?? undefined
      }
    });
  }

  update(id: string, dto: UpdateWaitlistEntryDto) {
    return this.prisma.waitlistEntry.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name || null } : {}),
        ...(dto.email !== undefined ? { email: dto.email || null } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone || null } : {}),
        ...(dto.desiredCourse !== undefined ? { desiredCourse: dto.desiredCourse || null } : {}),
        ...(dto.country !== undefined ? { country: dto.country || null } : {})
      }
    });
  }

  delete(id: string) {
    return this.prisma.waitlistEntry.delete({ where: { id } });
  }
}
