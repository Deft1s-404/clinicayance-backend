import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { IntegrationKeyGuard } from '../common/guards/integration-key.guard';
import { KnowledgeContextQueryDto } from './dto/knowledge-context-query.dto';
import { KnowledgeService } from './knowledge.service';

@Controller('ai/knowledge')
export class KnowledgeContextController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('context')
  @Public()
  @UseGuards(IntegrationKeyGuard)
  getContext(@Query() query: KnowledgeContextQueryDto) {
    return this.knowledgeService.buildContext(query);
  }
}

