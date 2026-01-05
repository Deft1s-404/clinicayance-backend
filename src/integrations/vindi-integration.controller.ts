import { Body, Controller, Get, Post } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { VindiConnectDto } from './dto/vindi-connect.dto';
import { VindiIntegrationService, VindiIntegrationStatus } from './vindi-integration.service';

type AuthenticatedUser = {
  userId: string;
  email: string;
};

@Controller('integrations/vindi')
export class VindiIntegrationController {
  constructor(private readonly vindiIntegrationService: VindiIntegrationService) {}

  @Get('status')
  getStatus(): Promise<VindiIntegrationStatus> {
    return this.vindiIntegrationService.getStatus();
  }

  @Post('connect')
  connect(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: VindiConnectDto
  ): Promise<VindiIntegrationStatus> {
    return this.vindiIntegrationService.saveApiKey(user.userId, dto.apiKey);
  }
}
