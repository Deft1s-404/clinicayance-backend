import { PrismaService } from '../prisma/prisma.service';
interface DateRange {
    start?: string;
    end?: string;
}
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    funnel(): Promise<{
        counts: {
            lead_created: number;
            lead_qualified: number;
            appointment_booked: number;
            appointment_completed: number;
            payment_confirmed: number;
        };
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
