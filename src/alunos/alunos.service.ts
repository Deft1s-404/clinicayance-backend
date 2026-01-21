import { Injectable, NotFoundException } from '@nestjs/common';
import { Aluno, Prisma } from '@prisma/client';

import { AlunosRepository, PaginatedAlunos } from './alunos.repository';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { ListAlunosQueryDto } from './dto/list-alunos-query.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';

@Injectable()
export class AlunosService {
  constructor(private readonly alunosRepository: AlunosRepository) {}

  list(query: ListAlunosQueryDto): Promise<PaginatedAlunos> {
    return this.alunosRepository.findMany(query);
  }

  async findById(id: string): Promise<Aluno> {
    const aluno = await this.alunosRepository.findById(id);

    if (!aluno) {
      throw new NotFoundException('Aluno nao encontrado');
    }

    return aluno;
  }

  create(dto: CreateAlunoDto): Promise<Aluno> {
    const data: Prisma.AlunoCreateInput = {
      nomeCompleto: dto.nomeCompleto,
      telefone: dto.telefone ?? undefined,
      pais: dto.pais ?? undefined,
      email: dto.email ?? undefined,
      profissao: dto.profissao ?? undefined,
      curso: dto.curso ?? undefined,
      pagamentoOk: dto.pagamentoOk ?? false
    };

    return this.alunosRepository.create(data);
  }

  async update(id: string, dto: UpdateAlunoDto): Promise<Aluno> {
    await this.findById(id);

    const data: Prisma.AlunoUpdateInput = {};

    if (dto.nomeCompleto !== undefined) data.nomeCompleto = dto.nomeCompleto;
    if (dto.telefone !== undefined) data.telefone = dto.telefone;
    if (dto.pais !== undefined) data.pais = dto.pais;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.profissao !== undefined) data.profissao = dto.profissao;
    if (dto.curso !== undefined) data.curso = dto.curso;
    if (dto.pagamentoOk !== undefined) data.pagamentoOk = dto.pagamentoOk;

    return this.alunosRepository.update(id, data);
  }

  async delete(id: string): Promise<Aluno> {
    await this.findById(id);
    return this.alunosRepository.delete(id);
  }
}
