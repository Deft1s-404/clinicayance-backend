import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAlunoDto {
  @IsString()
  nomeCompleto!: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  profissao?: string;

  @IsOptional()
  @IsString()
  curso?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', '1', 'on', 'yes'].includes(value.toLowerCase());
    }
    return Boolean(value);
  })
  @IsBoolean()
  pagamentoOk?: boolean;
}
