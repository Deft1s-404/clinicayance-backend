import { Injectable } from '@nestjs/common';
import { ClientStatus, LeadStage } from '@prisma/client';

import { ClientsService } from '../clients/clients.service';
import { LeadsService } from '../leads/leads.service';
import { GoogleFormsPayloadDto } from './dto/google-forms.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly leadsService: LeadsService
  ) {}

  async syncGoogleForms(payload: GoogleFormsPayloadDto) {
    const tagsFromPayload = payload.tags ?? [];

    let client =
      (payload.email && (await this.clientsService.findByEmail(payload.email))) ||
      (payload.phone && (await this.clientsService.findByPhone(payload.phone))) ||
      null;

    if (!client) {
      client = await this.clientsService.create({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        source: payload.source ?? 'Google Forms',
        tags: [...tagsFromPayload, 'google_forms'],
        status: ClientStatus.NEW,
        notes: payload.notes
      });
    } else {
      const mergedTags = Array.from(new Set([...(client.tags ?? []), ...tagsFromPayload, 'google_forms']));
      await this.clientsService.update(client.id, {
        name: payload.name ?? client.name,
        email: payload.email ?? client.email ?? undefined,
        phone: payload.phone ?? client.phone ?? undefined,
        source: payload.source ?? client.source ?? 'Google Forms',
        tags: mergedTags,
        notes: payload.notes ?? client.notes ?? undefined
      });

      client = await this.clientsService.findById(client.id);
    }

    const lead = await this.leadsService.create({
      clientId: client.id,
      source: payload.source ?? 'Google Forms',
      notes: payload.notes,
      stage: payload.stage ?? LeadStage.NEW
    });

    return {
      client,
      lead
    };
  }
}
