import { PrismaService } from '../prisma/prisma.service';
import { EvolutionService } from './evolution.service';
interface EvolutionQrPayload {
    svg: string | null;
    base64: string | null;
    code?: string | null;
    status: string | null;
    pairingCode?: string | null;
    count?: number | null;
}
export interface EvolutionSessionResponse {
    instanceId: string;
    status: 'connected' | 'pending' | 'disconnected';
    qrCode?: EvolutionQrPayload | null;
    number?: string | null;
    name?: string | null;
    providerStatus?: string;
    message?: string | null;
    pairingCode?: string | null;
}
export declare class EvolutionIntegrationService {
    private readonly prisma;
    private readonly evolutionService;
    private readonly logger;
    constructor(prisma: PrismaService, evolutionService: EvolutionService);
    startSession(userId: string, phoneNumber?: string): Promise<EvolutionSessionResponse>;
    refreshQr(userId: string, instanceId: string, phoneNumber?: string): Promise<EvolutionSessionResponse>;
    getStatus(userId: string, instanceId: string): Promise<EvolutionSessionResponse>;
    disconnect(userId: string, instanceId: string): Promise<EvolutionSessionResponse>;
    removeInstance(userId: string, instanceId: string): Promise<EvolutionSessionResponse>;
    getCurrentSession(userId: string): Promise<EvolutionSessionResponse | null>;
    private findLatestInstance;
    private createFreshSession;
    private fetchQr;
    private safeGetState;
    private getOwnedInstance;
    private updateInstance;
    private mergeMetadata;
    private readQrFromMetadata;
    private evolutionModel;
    private safeLogout;
    private resolveProviderInstanceId;
    private extractProviderIdFromMetadata;
    private extractRequestedNumberFromMetadata;
    private extractPairingCodeFromMetadata;
    private extractPhoneFromSummary;
    private extractPhoneFromMetadata;
    private extractNameFromMetadata;
    private mapStateToStatus;
    private buildInstanceName;
}
export {};
