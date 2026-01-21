import { IsNotEmpty, IsString } from 'class-validator';

export class PaypalManualConnectDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  clientSecret!: string;
}
