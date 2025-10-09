import { Injectable, NotFoundException } from '@nestjs/common';
import { Lead, LeadStage } from '@prisma/client';

import { calculateLeadScore } from '../common/utils/lead-scoring.util';
import { ClientsService } from '../clients/clients.service';
import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsQuery, LeadsRepository, PaginatedLeads } from './leads.repository';

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly clientsService: ClientsService,
    private readonly funnelEventsService: FunnelEventsService
  ) {}

  list(query: LeadsQuery): Promise<PaginatedLeads> {
    return this.leadsRepository.findMany(query);
  }

  async findById(id: string) {
    const lead = await this.leadsRepository.findById(id);

    if (!lead) {
      throw new NotFoundException('Lead nao encontrado');
    }

    return lead;
  }

  async create(dto: CreateLeadDto): Promise<Lead> {
    const client = await this.clientsService.findById(dto.clientId);
    const stage = dto.stage ?? LeadStage.NEW;

    const score = calculateLeadScore({
      source: dto.source ?? client.source ?? undefined,
      tags: client.tags,
      status: client.status,
      stage
    });

    const lead = await this.leadsRepository.create({
      client: { connect: { id: dto.clientId } },
      source: dto.source,
      notes: dto.notes,
      stage,
      score
    });

    await this.clientsService.updateScore(client.id, score);
    await this.funnelEventsService.recordEvent(client.id, 'lead_created', {
      leadId: lead.id,
      stage,
      score
    });

    if (stage === LeadStage.QUALIFIED) {
      await this.funnelEventsService.recordEvent(client.id, 'lead_qualified', {
        leadId: lead.id
      });
    }

    return lead;
  }

  async update(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findById(id);
    const client = await this.clientsService.findById(lead.clientId);
    const stage = dto.stage ?? lead.stage;

    const score = calculateLeadScore({
      source: dto.source ?? lead.source ?? client.source ?? undefined,
      tags: client.tags,
      status: client.status,
      stage
    });

    const updatedLead = await this.leadsRepository.update(id, {
      ...dto,
      stage,
      score
    });

    await this.clientsService.updateScore(client.id, score);

    if (lead.stage !== stage && stage === LeadStage.QUALIFIED) {
      await this.funnelEventsService.recordEvent(client.id, 'lead_qualified', {
        leadId: lead.id
      });
    }

    return updatedLead;
  }

  async delete(id: string): Promise<Lead> {
    await this.findById(id);
    return this.leadsRepository.delete(id);
  }
}
