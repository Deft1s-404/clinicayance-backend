import { LeadStage } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class LeadsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;
}
