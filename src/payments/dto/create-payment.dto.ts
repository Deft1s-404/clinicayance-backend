import { PaymentStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  appointmentId!: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  value!: number;

  @IsString()
  method!: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  pixTxid?: string;

  @IsOptional()
  @IsString()
  comprovanteUrl?: string;
}
