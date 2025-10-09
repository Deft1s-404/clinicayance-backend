import { Module } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';
import { FunnelEventsModule } from '../funnel-events/funnel-events.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadsController } from './leads.controller';
import { LeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';

@Module({
  imports: [PrismaModule, ClientsModule, FunnelEventsModule],
  controllers: [LeadsController],
  providers: [LeadsService, LeadsRepository],
  exports: [LeadsService]
})
export class LeadsModule {}
