import { Injectable } from '@nestjs/common';
import { Aluno, Prisma } from '@prisma/client';

import { ListAlunosQueryDto } from './dto/list-alunos-query.dto';
import { PrismaService } from '../prisma/prisma.service';

export interface PaginatedAlunos {
  data: Aluno[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class AlunosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ListAlunosQueryDto): Promise<PaginatedAlunos> {
    const { page = 1, limit = 20, search, curso, pais, pagamentoOk, nome, contato } = query;

    const searchConditions: Prisma.AlunoWhereInput[] | undefined = search
      ? [
          { nomeCompleto: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { telefone: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { profissao: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { curso: { contains: search, mode: Prisma.QueryMode.insensitive } }
        ]
      : undefined;

    const filterConditions: Prisma.AlunoWhereInput[] = [];

    if (curso) {
      filterConditions.push({
        curso: { contains: curso, mode: Prisma.QueryMode.insensitive }
      });
    }

    if (pais) {
      filterConditions.push({
        pais: { contains: pais, mode: Prisma.QueryMode.insensitive }
      });
    }

    if (pagamentoOk !== undefined) {
      filterConditions.push({ pagamentoOk });
    }

    if (nome) {
      filterConditions.push({
        nomeCompleto: { contains: nome, mode: Prisma.QueryMode.insensitive }
      });
    }

    if (contato) {
      filterConditions.push({
        OR: [
          { email: { contains: contato, mode: Prisma.QueryMode.insensitive } },
          { telefone: { contains: contato, mode: Prisma.QueryMode.insensitive } }
        ]
      });
    }

    const where: Prisma.AlunoWhereInput = {};

    if (searchConditions) {
      where.OR = searchConditions;
    }

    if (filterConditions.length > 0) {
      where.AND = filterConditions;
    }

    const finalWhere =
      !searchConditions && filterConditions.length === 0 ? undefined : where;

    const [data, total] = await Promise.all([
      this.prisma.aluno.findMany({
        where: finalWhere,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.aluno.count({ where: finalWhere })
    ]);

    return { data, total, page, limit };
  }

  findById(id: string): Promise<Aluno | null> {
    return this.prisma.aluno.findUnique({ where: { id } });
  }

  create(data: Prisma.AlunoCreateInput): Promise<Aluno> {
    return this.prisma.aluno.create({ data });
  }

  update(id: string, data: Prisma.AlunoUpdateInput): Promise<Aluno> {
    return this.prisma.aluno.update({ where: { id }, data });
  }

  delete(id: string): Promise<Aluno> {
    return this.prisma.aluno.delete({ where: { id } });
  }
}
