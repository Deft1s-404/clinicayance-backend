import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { LeadStage } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PaginatedLeads } from './leads.repository';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto, @Query('stage') stage?: LeadStage): Promise<PaginatedLeads> {
    return this.leadsService.list({ ...query, stage });
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.leadsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.delete(id);
  }
}
