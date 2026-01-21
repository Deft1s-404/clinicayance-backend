import { Injectable } from '@nestjs/common';
import { CalendarEntry, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ListCalendarEntriesDto } from './dto/list-calendar-entries.dto';

export interface PaginatedCalendarEntries {
  data: CalendarEntry[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class CalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ListCalendarEntriesDto): Promise<PaginatedCalendarEntries> {
    const {
      page = 1,
      limit = 20,
      type,
      start,
      end,
      country,
      onlyFuture,
      search
    } = query;

    const where: Prisma.CalendarEntryWhereInput = {};
    const andFilters: Prisma.CalendarEntryWhereInput[] = [];

    if (type) {
      where.type = type;
    }

    if (start) {
      andFilters.push({ end: { gte: new Date(start) } });
    }

    if (end) {
      andFilters.push({ start: { lte: new Date(end) } });
    }

    if (onlyFuture) {
      andFilters.push({ end: { gte: new Date() } });
    }

    if (andFilters.length) {
      where.AND = andFilters;
    }

    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    if (search) {
      const searchFilter: Prisma.CalendarEntryWhereInput[] = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } }
      ];

      where.OR = searchFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.calendarEntry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ start: 'asc' }, { createdAt: 'asc' }]
      }),
      this.prisma.calendarEntry.count({ where })
    ]);

    return { data, total, page, limit };
  }

  findById(id: string): Promise<CalendarEntry | null> {
    return this.prisma.calendarEntry.findUnique({ where: { id } });
  }

  create(
    data: Prisma.CalendarEntryCreateInput
  ): Promise<CalendarEntry> {
    return this.prisma.calendarEntry.create({ data });
  }

  update(
    id: string,
    data: Prisma.CalendarEntryUpdateInput
  ): Promise<CalendarEntry> {
    return this.prisma.calendarEntry.update({ where: { id }, data });
  }

  delete(id: string): Promise<CalendarEntry> {
    return this.prisma.calendarEntry.delete({ where: { id } });
  }
}
