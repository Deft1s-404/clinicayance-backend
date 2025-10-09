import { FunnelEventsService } from '../funnel-events/funnel-events.service';
import { PrismaService } from '../prisma/prisma.service';
interface DateRange {
    start?: string;
    end?: string;
}
export declare class ReportsService {
    private readonly prisma;
    private readonly funnelEventsService;
    constructor(prisma: PrismaService, funnelEventsService: FunnelEventsService);
    funnel(): Promise<{
        counts: Record<string, number>;
        conversionRate: number;
    }>;
    revenue(period: 'day' | 'month', range: DateRange): Promise<{
        total: number;
        series: {
            label: string;
            total: number;
        }[];
    }>;
    appointments(range: DateRange): Promise<{
        byStatus: Record<string, number>;
        byWeek: {
            label: string;
            total: number;
        }[];
    }>;
}
export {};
