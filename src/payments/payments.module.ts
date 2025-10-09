import { Module } from '@nestjs/common';

import { AppointmentsModule } from '../appointments/appointments.module';
import { FunnelEventsModule } from '../funnel-events/funnel-events.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule, AppointmentsModule, FunnelEventsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository],
  exports: [PaymentsService]
})
export class PaymentsModule {}
