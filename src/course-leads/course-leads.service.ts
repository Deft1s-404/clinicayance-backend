import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseLead, Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { CourseLeadsRepository, PaginatedCourseLeads } from './course-leads.repository';
import { CreateCourseLeadDto } from './dto/create-course-lead.dto';
import { UpdateCourseLeadDto } from './dto/update-course-lead.dto';

@Injectable()
export class CourseLeadsService {
  constructor(private readonly courseLeadsRepository: CourseLeadsRepository) {}

  list(query: PaginationQueryDto): Promise<PaginatedCourseLeads> {
    return this.courseLeadsRepository.findMany(query);
  }

  async findById(id: string): Promise<CourseLead> {
    const lead = await this.courseLeadsRepository.findById(id);

    if (!lead) {
      throw new NotFoundException('Lead de curso nao encontrado');
    }

    return lead;
  }

  create(dto: CreateCourseLeadDto): Promise<CourseLead> {
    const data: Prisma.CourseLeadCreateInput = {
      nomeCompleto: dto.nomeCompleto,
      telefone: dto.telefone ?? undefined,
      pais: dto.pais ?? undefined,
      email: dto.email ?? undefined,
      origem: dto.origem ?? undefined,
      nota: dto.nota ?? undefined
    };

    return this.courseLeadsRepository.create(data);
  }

  async update(id: string, dto: UpdateCourseLeadDto): Promise<CourseLead> {
    await this.findById(id);

    const data: Prisma.CourseLeadUpdateInput = {};

    if (dto.nomeCompleto !== undefined) data.nomeCompleto = dto.nomeCompleto;
    if (dto.telefone !== undefined) data.telefone = dto.telefone;
    if (dto.pais !== undefined) data.pais = dto.pais;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.origem !== undefined) data.origem = dto.origem;
    if (dto.nota !== undefined) data.nota = dto.nota;

    return this.courseLeadsRepository.update(id, data);
  }

  async delete(id: string): Promise<CourseLead> {
    await this.findById(id);
    return this.courseLeadsRepository.delete(id);
  }
}
