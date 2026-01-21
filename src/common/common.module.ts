import { Module } from '@nestjs/common';

import { IntegrationKeyGuard } from './guards/integration-key.guard';

@Module({
  providers: [IntegrationKeyGuard],
  exports: [IntegrationKeyGuard]
})
export class CommonModule {}
