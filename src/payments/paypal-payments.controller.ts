import {
  Body,
  Controller,
  BadRequestException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { IntegrationKeyGuard } from '../common/guards/integration-key.guard';
import { PaypalAccountsService } from '../integrations/paypal-accounts.service';
import { PaypalManualTokenResponse, PaypalPaymentsService } from './paypal-payments.service';
import { PaypalSyncDto } from './dto/paypal-sync.dto';
import { PaypalTransactionsFilterDto } from './dto/paypal-transactions-filter.dto';
import { PaypalUpdateTransactionDto } from './dto/paypal-update-transaction.dto';
import { PaypalAutomationSyncDto } from './dto/paypal-automation-sync.dto';
import { PaypalIncomingPaymentDto } from './dto/paypal-incoming-payment.dto';

type AuthenticatedUser = {
  userId: string;
  email: string;
};

@Controller('payments/paypal')
export class PaypalPaymentsController {
  constructor(
    private readonly paypalPaymentsService: PaypalPaymentsService,
    private readonly paypalAccountsService: PaypalAccountsService
  ) {}

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

  @Public()
  @UseGuards(IntegrationKeyGuard)
  @Post('automation/sync')
  async automationSync(@Body() body: PaypalAutomationSyncDto) {
    const account = await this.paypalAccountsService.findByMerchantId(body.merchantId);
    const { merchantId: _merchantId, ...syncPayload } = body;

    return this.paypalPaymentsService.syncTransactions(account.userId, syncPayload);
  }

  @Public()
  @UseGuards(IntegrationKeyGuard)
  @Post('incoming')
  async storeIncoming(@Body() body: PaypalIncomingPaymentDto) {
    return this.paypalPaymentsService.storeIncomingTransaction(body);
  }

  @Public()
  @UseGuards(IntegrationKeyGuard)
  @Post('tokens/manual')
  async issueManualToken(@Body('merchantId') merchantId: string): Promise<PaypalManualTokenResponse> {
    if (!merchantId || typeof merchantId !== 'string') {
      throw new BadRequestException('merchantId obrigatorio.');
    }

    return this.paypalPaymentsService.issueManualAccessToken(merchantId.trim());
  }
}
