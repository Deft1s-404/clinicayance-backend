import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CalendarEntry, CalendarEntryType, Prisma } from '@prisma/client';

import { CalendarRepository, PaginatedCalendarEntries } from './calendar.repository';
import { CreateCalendarEntryDto } from './dto/create-calendar-entry.dto';
import { ListCalendarEntriesDto } from './dto/list-calendar-entries.dto';
import { UpdateCalendarEntryDto } from './dto/update-calendar-entry.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  list(query: ListCalendarEntriesDto): Promise<PaginatedCalendarEntries> {
    return this.calendarRepository.findMany(query);
  }

  async findById(id: string): Promise<CalendarEntry> {
    const entry = await this.calendarRepository.findById(id);

    if (!entry) {
      throw new NotFoundException(`Calendar entry ${id} was not found.`);
    }

    return entry;
  }

  async create(dto: CreateCalendarEntryDto): Promise<CalendarEntry> {
    const { start, end } = this.resolveRange(dto.start, dto.end);

    const data: Prisma.CalendarEntryCreateInput = {
      title: dto.title,
      description: dto.description,
      type: dto.type ?? CalendarEntryType.AVAILABLE,
      start,
      end,
      allDay: dto.allDay ?? false,
      timezone: dto.timezone,
      country: dto.country,
      city: dto.city,
      location: dto.location,
      notes: dto.notes,
      ...(dto.metadata !== undefined
        ? { metadata: dto.metadata as Prisma.InputJsonValue }
        : {})
    };

    return this.calendarRepository.create(data);
  }

  async update(id: string, dto: UpdateCalendarEntryDto): Promise<CalendarEntry> {
    const existing = await this.calendarRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Calendar entry ${id} was not found.`);
    }

    const startDate = dto.start ? this.parseDate('start', dto.start) : existing.start;
    const endDate = dto.end ? this.parseDate('end', dto.end) : existing.end;

    this.ensureChronologicalRange(startDate, endDate);

    const data: Prisma.CalendarEntryUpdateInput = {
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.type !== undefined ? { type: dto.type } : {}),
      ...(dto.start !== undefined ? { start: startDate } : {}),
      ...(dto.end !== undefined ? { end: endDate } : {}),
      ...(dto.allDay !== undefined ? { allDay: dto.allDay } : {}),
      ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
      ...(dto.city !== undefined ? { city: dto.city } : {}),
      ...(dto.location !== undefined ? { location: dto.location } : {}),
      ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      ...(dto.metadata !== undefined ? { metadata: dto.metadata as Prisma.InputJsonValue } : {})
    };

    return this.calendarRepository.update(id, data);
  }

  delete(id: string): Promise<CalendarEntry> {
    return this.calendarRepository.delete(id);
  }

  private resolveRange(start: string, end: string): { start: Date; end: Date } {
    const startDate = this.parseDate('start', start);
    const endDate = this.parseDate('end', end);

    this.ensureChronologicalRange(startDate, endDate);

    return { start: startDate, end: endDate };
  }

  private ensureChronologicalRange(start: Date, end: Date): void {
    if (start >= end) {
      throw new BadRequestException('The start date/time must be before the end date/time.');
    }
  }

  private parseDate(field: 'start' | 'end', value: string): Date {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`The ${field} value is not a valid ISO date.`);
    }

    return date;
  }
}
