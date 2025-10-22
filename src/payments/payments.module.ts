import { Module } from '@nestjs/common';

import { AppointmentsModule } from '../appointments/appointments.module';
import { FunnelEventsModule } from '../funnel-events/funnel-events.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaypalPaymentsController } from './paypal-payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';
import { PaypalPaymentsService } from './paypal-payments.service';

@Module({
  imports: [PrismaModule, AppointmentsModule, FunnelEventsModule, IntegrationsModule],
  controllers: [PaymentsController, PaypalPaymentsController],
  providers: [PaymentsService, PaymentsRepository, PaypalPaymentsService],
  exports: [PaymentsService, PaypalPaymentsService]
})
export class PaymentsModule {}
