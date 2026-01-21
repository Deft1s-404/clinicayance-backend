import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CreateWaitlistEntryDto } from './dto/create-waitlist-entry.dto';
import { ListWaitlistDto } from './dto/list-waitlist.dto';
import { UpdateWaitlistEntryDto } from './dto/update-waitlist-entry.dto';
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Get()
  list(@Query() query: ListWaitlistDto) {
    return this.waitlistService.list(query);
  }

  @Post()
  create(@Body() dto: CreateWaitlistEntryDto) {
    return this.waitlistService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWaitlistEntryDto) {
    return this.waitlistService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.waitlistService.delete(id);
  }
}
