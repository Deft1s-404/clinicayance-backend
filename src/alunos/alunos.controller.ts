import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { AlunosService } from './alunos.service';
import { PaginatedAlunos } from './alunos.repository';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';

@Controller('alunos')
export class AlunosController {
  constructor(private readonly alunosService: AlunosService) {}

  @Get()
  list(@Query() query: PaginationQueryDto): Promise<PaginatedAlunos> {
    return this.alunosService.list(query);
  }

  @Get(':id')
  find(@Param('id') id: string) {
    return this.alunosService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateAlunoDto) {
    return this.alunosService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlunoDto) {
    return this.alunosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alunosService.delete(id);
  }
}

