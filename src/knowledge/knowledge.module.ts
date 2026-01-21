import { Module } from '@nestjs/common';

import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
import { KnowledgeContextController } from './knowledge-context.controller';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [KnowledgeController, KnowledgeContextController],
  providers: [KnowledgeService]
})
export class KnowledgeModule {}

