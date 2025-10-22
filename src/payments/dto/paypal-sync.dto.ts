import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  Min
} from 'class-validator';

const TRANSACTION_STATUSES = ['S', 'V', 'P', 'F', 'C', 'D'] as const;

export type PaypalSyncStatus = (typeof TRANSACTION_STATUSES)[number];

export class PaypalSyncDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsIn(TRANSACTION_STATUSES)
  transactionStatus?: PaypalSyncStatus;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  @IsInt()
  @Min(1)
  maxPages?: number;
}

