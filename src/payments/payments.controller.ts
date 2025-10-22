import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsListQueryDto } from './dto/payments-list-query.dto';
import { PaginatedPayments } from './payments.repository';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  list(@Query() query: PaymentsListQueryDto): Promise<PaginatedPayments> {
    return this.paymentsService.list(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.delete(id);
  }

  @Post('webhook')
  webhook(@Body() dto: PaymentWebhookDto) {
    return this.paymentsService.handleWebhook(dto);
  }
}
