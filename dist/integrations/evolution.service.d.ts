import { ConfigService } from '@nestjs/config';
export interface EvolutionCreatedInstance {
    id: string;
    name?: string;
    providerId?: string;
    token?: string;
    raw?: Record<string, unknown>;
}
interface QrCodeResponse {
    qrCode?: string;
    base64?: string;
    status?: string;
    pairingCode?: string;
    code?: string;
    count?: number;
}
interface InstanceStateResponse {
    instance?: {
        instanceName: string;
        state: string;
    };
    status?: string;
    message?: string;
}
export interface EvolutionInstanceSummary {
    id: string;
    name: string;
    instanceName?: string;
    connectionStatus?: string | null;
    ownerJid?: string | null;
    profileName?: string | null;
    profilePicUrl?: string | null;
    integration?: string | null;
    number?: string | null;
    token?: string | null;
}
export declare class EvolutionService {
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly defaultIntegration?;
    private readonly defaultTemplate?;
    private readonly defaultChannel?;
    private readonly defaultToken?;
    constructor(configService: ConfigService);
    createInstance(instanceName: string, config?: Record<string, unknown>): Promise<EvolutionCreatedInstance>;
    getQrCode(instanceId: string, number?: string): Promise<QrCodeResponse>;
    getState(instanceId: string): Promise<InstanceStateResponse>;
    logout(instanceId: string): Promise<void>;
    fetchInstance(instanceName: string, providerInstanceId?: string | null): Promise<EvolutionInstanceSummary | null>;
    delete(instanceId: string): Promise<void>;
    private request;
}
export {};
