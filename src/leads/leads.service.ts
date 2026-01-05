import { Injectable, NotFoundException } from '@nestjs/common';
import { Lead, LeadStage } from '@prisma/client';

import { calculateLeadScore } from '../common/utils/lead-scoring.util';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsQuery, LeadsRepository, PaginatedLeads } from './leads.repository';

@Injectable()
export class LeadsService {
  constructor(private readonly leadsRepository: LeadsRepository) {}

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
    const stage = dto.stage ?? LeadStage.NEW;

    const score = calculateLeadScore({
      source: dto.source ?? undefined,
      stage
    });

    return this.leadsRepository.create({
      name: dto.name ?? undefined,
      email: dto.email ?? undefined,
      phone: dto.phone ?? undefined,
      source: dto.source ?? undefined,
      notes: dto.notes ?? undefined,
      stage,
      score
    });
  }

  async update(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findById(id);
    const stage = dto.stage ?? lead.stage;

    const score = calculateLeadScore({
      source: dto.source ?? lead.source ?? undefined,
      stage
    });

    return this.leadsRepository.update(id, {
      name: dto.name ?? undefined,
      email: dto.email ?? undefined,
      phone: dto.phone ?? undefined,
      source: dto.source ?? undefined,
      notes: dto.notes ?? undefined,
      stage,
      score
    });
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
      'name',
      'email',
      'phone',
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
          escape(lead.name ?? ''),
          escape(lead.email ?? ''),
          escape(lead.phone ?? ''),
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
