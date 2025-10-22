import { IsOptional, IsString } from 'class-validator';

export class PaypalUpdateTransactionDto {
  @IsOptional()
  @IsString()
  clientId?: string | null;
}

