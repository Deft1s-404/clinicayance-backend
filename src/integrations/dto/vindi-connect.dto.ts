import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VindiConnectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  apiKey!: string;
}
