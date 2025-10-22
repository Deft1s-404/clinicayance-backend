import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min
} from 'class-validator';

const TRANSACTION_STATUSES = ['S', 'V', 'P', 'F', 'C', 'D'] as const;

export type PaypalStoredStatus = (typeof TRANSACTION_STATUSES)[number];

export class PaypalTransactionsFilterDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsIn(TRANSACTION_STATUSES)
  status?: PaypalStoredStatus;

  @IsOptional()
  @IsEmail()
  payerEmail?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number;
}

