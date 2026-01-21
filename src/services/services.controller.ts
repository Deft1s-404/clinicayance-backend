import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CreateServiceOfferingDto } from './dto/create-service-offering.dto';
import { ListServiceOfferingsDto } from './dto/list-service-offerings.dto';
import { UpdateServiceOfferingDto } from './dto/update-service-offering.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  list(@Query() query: ListServiceOfferingsDto) {
    return this.servicesService.list(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateServiceOfferingDto) {
    return this.servicesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceOfferingDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.delete(id);
  }
}
