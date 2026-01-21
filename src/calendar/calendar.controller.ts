import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CalendarService } from './calendar.service';
import { CreateCalendarEntryDto } from './dto/create-calendar-entry.dto';
import { ListCalendarEntriesDto } from './dto/list-calendar-entries.dto';
import { UpdateCalendarEntryDto } from './dto/update-calendar-entry.dto';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  list(@Query() query: ListCalendarEntriesDto) {
    return this.calendarService.list(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.calendarService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCalendarEntryDto) {
    return this.calendarService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCalendarEntryDto) {
    return this.calendarService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calendarService.delete(id);
  }
}
