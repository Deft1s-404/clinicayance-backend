import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { Public } from '../common/decorators/public.decorator';
import { CourseLeadsService } from './course-leads.service';
import { PaginatedCourseLeads } from './course-leads.repository';
import { CreateCourseLeadDto } from './dto/create-course-lead.dto';
import { UpdateCourseLeadDto } from './dto/update-course-lead.dto';

@Controller('course-leads')
export class CourseLeadsController {
  constructor(private readonly courseLeadsService: CourseLeadsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto): Promise<PaginatedCourseLeads> {
    return this.courseLeadsService.list(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.courseLeadsService.findById(id);
  }

  @Public()
  @Post()
  create(@Body() dto: CreateCourseLeadDto) {
    return this.courseLeadsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseLeadDto) {
    return this.courseLeadsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseLeadsService.delete(id);
  }
}
