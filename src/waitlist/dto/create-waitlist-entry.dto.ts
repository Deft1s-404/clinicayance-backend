import { IsOptional, IsString } from 'class-validator';

export class CreateWaitlistEntryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  desiredCourse?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
