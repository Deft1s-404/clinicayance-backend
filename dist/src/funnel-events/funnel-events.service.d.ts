import { FunnelEvent, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class FunnelEventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    recordEvent(clientId: string, type: string, meta?: Prisma.InputJsonValue): Promise<FunnelEvent>;
    countByType(types: string[]): Promise<Record<string, number>>;
    eventsBetween(type: string, start: Date, end: Date): Promise<number>;
}
