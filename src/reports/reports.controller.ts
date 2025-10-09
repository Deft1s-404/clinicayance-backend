import { Controller, Get, Query } from '@nestjs/common';

import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('funnel')
  funnel() {
    return this.reportsService.funnel();
  }

  @Get('revenue')
  revenue(
    @Query('period') period: 'day' | 'month' = 'day',
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    return this.reportsService.revenue(period, { start, end });
  }

  @Get('appointments')
  appointments(@Query('start') start?: string, @Query('end') end?: string) {
    return this.reportsService.appointments({ start, end });
  }
}
