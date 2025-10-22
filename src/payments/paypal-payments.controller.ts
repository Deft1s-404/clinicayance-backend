import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaypalPaymentsService } from './paypal-payments.service';
import { PaypalSyncDto } from './dto/paypal-sync.dto';
import { PaypalTransactionsFilterDto } from './dto/paypal-transactions-filter.dto';
import { PaypalUpdateTransactionDto } from './dto/paypal-update-transaction.dto';

type AuthenticatedUser = {
  userId: string;
  email: string;
};

@Controller('payments/paypal')
export class PaypalPaymentsController {
  constructor(private readonly paypalPaymentsService: PaypalPaymentsService) {}

  @Post('sync')
  sync(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: PaypalSyncDto
  ) {
    return this.paypalPaymentsService.syncTransactions(user.userId, body);
  }

  @Get('transactions')
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaypalTransactionsFilterDto
  ) {
    return this.paypalPaymentsService.listStoredTransactions(user.userId, query);
  }

  @Get('transactions/:id')
  getById(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.paypalPaymentsService.getStoredTransaction(user.userId, id);
  }

  @Patch('transactions/:id')
  updateClient(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: PaypalUpdateTransactionDto
  ) {
    const normalizedClientId =
      body.clientId === undefined ? undefined : body.clientId?.trim() || null;

    return this.paypalPaymentsService.updateTransactionClient(
      user.userId,
      id,
      normalizedClientId ?? null
    );
  }
}
