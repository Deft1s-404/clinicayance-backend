import { IsNotEmpty, IsString } from 'class-validator';

import { PaypalSyncDto } from './paypal-sync.dto';

export class PaypalAutomationSyncDto extends PaypalSyncDto {
  @IsString()
  @IsNotEmpty()
  merchantId!: string;
}
