import { EvolutionIntegrationService } from './evolution-integration.service';
import type { EvolutionSessionResponse } from './evolution-integration.service';
import { EvolutionGenerateQrDto } from './dto/evolution-generate-qr.dto';
import { EvolutionCreateInstanceDto } from './dto/evolution-create-instance.dto';
type AuthenticatedUser = {
    userId: string;
    email: string;
};
export declare class EvolutionController {
    private readonly evolutionIntegrationService;
    constructor(evolutionIntegrationService: EvolutionIntegrationService);
    getCurrent(user: AuthenticatedUser): Promise<EvolutionSessionResponse | null>;
    listInstances(user: AuthenticatedUser): Promise<EvolutionSessionResponse[]>;
    startSession(user: AuthenticatedUser, dto: EvolutionGenerateQrDto): Promise<EvolutionSessionResponse>;
    createInstance(user: AuthenticatedUser, dto: EvolutionCreateInstanceDto): Promise<EvolutionSessionResponse>;
    refreshQr(user: AuthenticatedUser, instanceId: string, dto: EvolutionGenerateQrDto): Promise<EvolutionSessionResponse>;
    getStatus(user: AuthenticatedUser, instanceId: string): Promise<EvolutionSessionResponse>;
    disconnect(user: AuthenticatedUser, instanceId: string): Promise<EvolutionSessionResponse>;
    removeInstance(user: AuthenticatedUser, instanceId: string): Promise<EvolutionSessionResponse>;
}
export {};
