import { Module } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';
import { LeadsModule } from '../leads/leads.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';

@Module({
  imports: [ClientsModule, LeadsModule],
  controllers: [IntegrationsController],
  providers: [IntegrationsService]
})
export class IntegrationsModule {}
