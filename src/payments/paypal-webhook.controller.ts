import { Body, Controller, Post, Req } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { PaypalWebhookService } from './paypal-webhook.service';

@Controller('payments/paypal/webhook')
export class PaypalWebhookController {
  constructor(private readonly paypalWebhookService: PaypalWebhookService) {}

  @Public()
  @Post()
  async handleWebhook(
    @Req() req: { headers: Record<string, string>; rawBody?: string },
    @Body() body: Record<string, any>
  ) {
    await this.paypalWebhookService.handleEvent(
      {
        authAlgo: req.headers['paypal-auth-algo'] ?? null,
        certUrl: req.headers['paypal-cert-url'] ?? null,
        transmissionId: req.headers['paypal-transmission-id'] ?? null,
        transmissionSig: req.headers['paypal-transmission-sig'] ?? null,
        transmissionTime: req.headers['paypal-transmission-time'] ?? null
      },
      req.rawBody ?? JSON.stringify(body),
      body
    );

    return { received: true };
  }
}
