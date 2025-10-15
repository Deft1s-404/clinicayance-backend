import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
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
    revenue(period?: 'day' | 'month', start?: string, end?: string): Promise<{
        total: number;
        series: {
            label: string;
            total: number;
        }[];
    }>;
    appointments(start?: string, end?: string): Promise<{
        byStatus: Record<string, number>;
        byWeek: {
            label: string;
            total: number;
        }[];
    }>;
}
