import { Module } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';
import { LeadsModule } from '../leads/leads.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GoogleOAuthController } from './google-oauth.controller';
import { GoogleOAuthService } from './google-oauth.service';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';

/**
 * Módulo que agrega todas as integrações externas (Google Forms, OAuth e Calendar).
 * Em produção basta manter este módulo importado para disponibilizar os endpoints /api/google/*
 */
@Module({
  imports: [ClientsModule, LeadsModule],
  controllers: [IntegrationsController, GoogleOAuthController, GoogleCalendarController],
  providers: [IntegrationsService, GoogleOAuthService, GoogleCalendarService]
})
export class IntegrationsModule {}
