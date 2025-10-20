import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { AppointmentsService } from './appointments.service';
import { PaginatedAppointments } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ListAppointmentsDto } from './dto/list-appointments.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  list(@Query() query: ListAppointmentsDto): Promise<PaginatedAppointments> {
    return this.appointmentsService.list(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.appointmentsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.delete(id);
  }
}
