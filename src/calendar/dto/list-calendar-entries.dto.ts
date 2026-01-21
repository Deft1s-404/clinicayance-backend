import { CalendarEntryType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { toBoolean } from '../../common/transformers/boolean.transformer';

export class ListCalendarEntriesDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(CalendarEntryType)
  type?: CalendarEntryType;

  @IsOptional()
  @IsISO8601()
  start?: string;

  @IsOptional()
  @IsISO8601()
  end?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  onlyFuture?: boolean;
}
