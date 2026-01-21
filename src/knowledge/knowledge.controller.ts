import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CreateKnowledgeEntryDto } from './dto/create-knowledge-entry.dto';
import { ListKnowledgeEntriesDto } from './dto/list-knowledge-entries.dto';
import { UpdateKnowledgeEntryDto } from './dto/update-knowledge-entry.dto';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  list(@Query() query: ListKnowledgeEntriesDto) {
    return this.knowledgeService.list(query);
  }

  @Get('filters')
  filters() {
    return this.knowledgeService.getFilterOptions();
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.knowledgeService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateKnowledgeEntryDto) {
    return this.knowledgeService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateKnowledgeEntryDto) {
    return this.knowledgeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.knowledgeService.delete(id);
  }
}
