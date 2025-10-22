import { PaymentStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class PaymentsListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'status invalido' })
  status?: PaymentStatus;
}

