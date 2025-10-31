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

  async exportCsv(query: LeadsQuery): Promise<{ filename: string; content: string }> {
    const rows = await this.leadsRepository.exportMany(query);

    const headers = [
      'id',
      'createdAt',
      'clientName',
      'clientEmail',
      'clientPhone',
      'source',
      'stage',
      'score',
      'notes'
    ];

    const escape = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const lines = [headers.join(',')];
    for (const lead of rows) {
      lines.push(
        [
          escape(lead.id),
          escape(lead.createdAt.toISOString()),
          escape(lead.client?.name ?? ''),
          escape(lead.client?.email ?? ''),
          escape(lead.client?.phone ?? ''),
          escape(lead.source ?? ''),
          escape(lead.stage),
          escape(lead.score),
          escape(lead.notes ?? '')
        ].join(',')
      );
    }

    const content = '\ufeff' + lines.join('\n');
    const tag = query.source ? `_${query.source}` : '';
    const filename = `leads${tag}_${new Date().toISOString().slice(0, 10)}.csv`;
    return { filename, content };
  }
}
