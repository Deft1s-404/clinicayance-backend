import { Body, Controller, Post } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { GoogleFormsPayloadDto } from './dto/google-forms.dto';
import { IntegrationsService } from './integrations.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Public()
  @Post('forms/google')
  syncGoogleForms(@Body() dto: GoogleFormsPayloadDto) {
    return this.integrationsService.syncGoogleForms(dto);
  }
}
