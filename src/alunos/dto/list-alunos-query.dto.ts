import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class ListAlunosQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  curso?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  contato?: string;

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
