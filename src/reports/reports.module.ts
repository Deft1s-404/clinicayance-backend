import { Module } from '@nestjs/common';

import { FunnelEventsModule } from '../funnel-events/funnel-events.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [PrismaModule, FunnelEventsModule],
  controllers: [ReportsController],
  providers: [ReportsService]
})
export class ReportsModule {}
