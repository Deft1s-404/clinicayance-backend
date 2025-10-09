import { Module } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';
import { FunnelEventsModule } from '../funnel-events/funnel-events.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [PrismaModule, ClientsModule, FunnelEventsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, AppointmentsRepository],
  exports: [AppointmentsService]
})
export class AppointmentsModule {}
