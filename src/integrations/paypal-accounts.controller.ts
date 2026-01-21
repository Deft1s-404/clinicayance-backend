import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { IntegrationKeyGuard } from '../common/guards/integration-key.guard';
import { PaypalAccountsService, PaypalAccountSummary } from './paypal-accounts.service';

@Controller('integrations/paypal/accounts')
@UseGuards(IntegrationKeyGuard)
@Public()
export class PaypalAccountsController {
  constructor(private readonly paypalAccountsService: PaypalAccountsService) {}

  @Get()
  list(): Promise<PaypalAccountSummary[]> {
    return this.paypalAccountsService.list();
  }

  @Get('merchant/:merchantId')
  getByMerchant(@Param('merchantId') merchantId: string): Promise<PaypalAccountSummary> {
    return this.paypalAccountsService.findByMerchantId(merchantId);
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: string): Promise<PaypalAccountSummary> {
    return this.paypalAccountsService.findByUserId(userId);
  }
}
