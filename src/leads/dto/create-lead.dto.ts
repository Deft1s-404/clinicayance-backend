import { LeadStage } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  clientId!: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(LeadStage)
  stage?: LeadStage;
}
