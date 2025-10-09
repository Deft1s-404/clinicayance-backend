import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CampaignsService } from './campaigns.service';
import { PaginatedCampaigns } from './campaigns.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto): Promise<PaginatedCampaigns> {
    return this.campaignsService.list(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campaignsService.delete(id);
  }

  @Post(':id/send')
  send(@Param('id') id: string) {
    return this.campaignsService.send(id);
  }
}
