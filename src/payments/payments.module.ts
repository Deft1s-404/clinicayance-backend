import { Module } from '@nestjs/common';

import { AppointmentsModule } from '../appointments/appointments.module';
import { FunnelEventsModule } from '../funnel-events/funnel-events.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { ConfigModule } from '@nestjs/config';
import { paypalConfig } from '../integrations/paypal.config';
import { PaymentsController } from './payments.controller';
import { PaypalPaymentsController } from './paypal-payments.controller';
import { PaypalWebhookController } from './paypal-webhook.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { PaypalPaymentsService } from './paypal-payments.service';
import { PaypalWebhookService } from './paypal-webhook.service';

@Module({
  imports: [
    PrismaModule,
    AppointmentsModule,
    FunnelEventsModule,
    IntegrationsModule,
    CommonModule,
    ConfigModule.forFeature(paypalConfig)
  ],
  controllers: [PaymentsController, PaypalPaymentsController, PaypalWebhookController],
  providers: [PaymentsService, PaymentsRepository, PaypalPaymentsService, PaypalWebhookService],
  exports: [PaymentsService, PaypalPaymentsService]
})
export class PaymentsModule {}
