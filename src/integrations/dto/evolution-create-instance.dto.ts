import { IsString, IsUrl } from 'class-validator';

export class EvolutionCreateInstanceDto {
  @IsString()
  instanceName!: string;

  @IsUrl()
  webhookUrl!: string;
}
