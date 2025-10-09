import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { ClientsService } from './clients.service';
import { PaginatedClients } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  list(@Query() query: PaginationQueryDto): Promise<PaginatedClients> {
    return this.clientsService.list(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.delete(id);
  }
}
