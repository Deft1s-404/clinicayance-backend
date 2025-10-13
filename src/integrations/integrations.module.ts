import { Module } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';
import { LeadsModule } from '../leads/leads.module';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GoogleOAuthController } from './google-oauth.controller';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';
import { EvolutionService } from './evolution.service';
import { EvolutionIntegrationService } from './evolution-integration.service';
import { EvolutionController } from './evolution.controller';

/**
 * Módulo que agrega todas as integrações externas (Google Forms, OAuth e Calendar).
 * Em produção basta manter este módulo importado para disponibilizar os endpoints /api/google/*
 */
@Module({
  imports: [ClientsModule, LeadsModule, PrismaModule],
  controllers: [
    IntegrationsController,
    GoogleOAuthController,
    GoogleCalendarController,
    EvolutionController
  ],
  providers: [
    IntegrationsService,
    GoogleOAuthService,
    GoogleCalendarService,
    EvolutionService,
    EvolutionIntegrationService
  ]
})
export class IntegrationsModule {}
