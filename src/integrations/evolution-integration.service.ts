import { HttpException, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { EvolutionInstanceSummary, EvolutionService } from './evolution.service';

interface EvolutionQrPayload {
  svg: string | null;
  base64: string | null;
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

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type EvolutionInstanceRecord = {
  id: string;
  userId: string;
  instanceId: string;
  providerInstanceId: string | null;
  status: string;
  connectedAt: Date | null;
  metadata: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class EvolutionIntegrationService {
  private readonly logger = new Logger(EvolutionIntegrationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly evolutionService: EvolutionService
  ) {}

  async startSession(userId: string, phoneNumber?: string): Promise<EvolutionSessionResponse> {
    const current = await this.findLatestInstance(userId);

    if (current) {
      const providerInstanceId = this.resolveProviderInstanceId(current);
      const [state, summary] = await Promise.all([
        this.safeGetState(current.instanceId),
        this.evolutionService.fetchInstance(current.instanceId, providerInstanceId).catch(() => null)
      ]);

      if (state || summary) {
        const providerState =
          state?.instance?.state ?? state?.status ?? summary?.connectionStatus ?? 'unknown';
        const status = this.mapStateToStatus(providerState);
        const summaryNumber = this.extractPhoneFromSummary(summary);

        const requestedNumber =
          phoneNumber ??
          summaryNumber ??
          this.extractRequestedNumberFromMetadata(current.metadata) ??
          this.extractPhoneFromMetadata(current.metadata);

        const metadataPatch: JsonObject = {
          lastState: providerState,
          connectionStatus: summary?.connectionStatus ?? null,
          ownerJid: summary?.ownerJid ?? null,
          profileName: summary?.profileName ?? null,
          profilePicUrl: summary?.profilePicUrl ?? null,
          number: requestedNumber ?? null,
          requestedNumber: requestedNumber ?? null,
          providerId: summary?.id ?? providerInstanceId ?? null,
          lastStatusAt: new Date().toISOString()
        };

        if (status === 'connected') {
          await this.safeLogout(current.instanceId);

          const qr = await this.fetchQr(
            current,
            summary?.id ?? providerInstanceId ?? null,
            requestedNumber ?? null
          );

          metadataPatch.lastPairingCode = qr.pairingCode ?? null;

          await this.updateInstance(current, {
            status: 'pending',
            connectedAt: null,
            metadata: metadataPatch,
            providerInstanceId: summary?.id ?? providerInstanceId ?? null
          });

          return {
            instanceId: current.instanceId,
            status: 'pending',
            qrCode: qr,
            number: requestedNumber ?? null,
            name: summary?.profileName ?? this.extractNameFromMetadata(current.metadata),
            providerStatus: providerState,
            message: state?.message ?? null,
            pairingCode: qr.pairingCode ?? this.extractPairingCodeFromMetadata(current.metadata)
          };
        }

        const qr = await this.fetchQr(
          current,
          summary?.id ?? providerInstanceId ?? null,
          requestedNumber ?? null
        );

        metadataPatch.lastPairingCode = qr.pairingCode ?? null;

        await this.updateInstance(current, {
          status: 'pending',
          connectedAt: null,
          metadata: metadataPatch,
          providerInstanceId: summary?.id ?? providerInstanceId ?? null
        });

        return {
          instanceId: current.instanceId,
          status: 'pending',
          qrCode: qr,
          number: requestedNumber ?? null,
          name: summary?.profileName ?? this.extractNameFromMetadata(current.metadata),
          providerStatus: providerState,
          message: state?.message ?? null,
          pairingCode: qr.pairingCode ?? this.extractPairingCodeFromMetadata(current.metadata)
        };
      } else {
        // Instance no longer exists on provider. Keep record disconnected to allow fresh creation.
        await this.updateInstance(current, {
          status: 'disconnected',
          connectedAt: null,
          metadata: {
            lastState: 'unknown',
            lastStatusAt: new Date().toISOString()
          } as JsonObject
        });
      }
    }

    return this.createFreshSession(userId, phoneNumber);
  }

  async refreshQr(userId: string, instanceId: string, phoneNumber?: string): Promise<EvolutionSessionResponse> {
    const instance = await this.getOwnedInstance(userId, instanceId);
    const providerInstanceId = this.resolveProviderInstanceId(instance);
    const [state, summary] = await Promise.all([
      this.safeGetState(instanceId),
      this.evolutionService.fetchInstance(instanceId, providerInstanceId).catch(() => null)
    ]);
    const providerState =
      state?.instance?.state ?? state?.status ?? summary?.connectionStatus ?? 'unknown';
    const summaryNumber = this.extractPhoneFromSummary(summary);

    if (providerState === 'connected' || providerState === 'open' || providerState === 'pending') {
      await this.safeLogout(instanceId);
    }

    const metadataPatch: JsonObject = {
      lastState: providerState,
      connectionStatus: summary?.connectionStatus ?? null,
      ownerJid: summary?.ownerJid ?? null,
      profileName: summary?.profileName ?? null,
      profilePicUrl: summary?.profilePicUrl ?? null,
      number: summaryNumber ?? null,
      providerId: summary?.id ?? providerInstanceId ?? null,
      lastStatusAt: new Date().toISOString()
    };

    const qr = await this.fetchQr(instance, summary?.id ?? providerInstanceId ?? null, phoneNumber ?? summaryNumber ?? null);

    await this.updateInstance(instance, {
      status: 'pending',
      connectedAt: null,
      metadata: metadataPatch,
      providerInstanceId: summary?.id ?? providerInstanceId ?? null
    });

    return {
      instanceId,
      status: 'pending',
      qrCode: qr,
      number: summaryNumber ?? this.extractPhoneFromMetadata(instance.metadata),
      name: summary?.profileName ?? this.extractNameFromMetadata(instance.metadata),
      providerStatus: providerState
    };
  }

  async getStatus(userId: string, instanceId: string): Promise<EvolutionSessionResponse> {
    const instance = await this.getOwnedInstance(userId, instanceId);
    const providerInstanceId = this.resolveProviderInstanceId(instance);
    const [state, summary] = await Promise.all([
      this.evolutionService.getState(instanceId),
      this.evolutionService.fetchInstance(instanceId, providerInstanceId).catch(() => null)
    ]);

    const providerState =
      state.instance?.state ?? state.status ?? summary?.connectionStatus ?? 'unknown';
    const status = this.mapStateToStatus(providerState);
    const storedQr = this.readQrFromMetadata(instance.metadata);
    const summaryNumber = this.extractPhoneFromSummary(summary);
    const connectedAt =
      status === 'connected'
        ? instance.connectedAt ?? new Date()
        : status === 'disconnected'
          ? null
          : instance.connectedAt ?? null;

    let qrCode: EvolutionQrPayload | null = null;

    if (status === 'pending') {
      qrCode = storedQr ?? (await this.fetchQr(instance, summary?.id ?? providerInstanceId ?? null));
    }

    await this.updateInstance(instance, {
      status,
      connectedAt,
      metadata: {
        lastState: providerState,
        connectionStatus: summary?.connectionStatus ?? null,
        ownerJid: summary?.ownerJid ?? null,
        profileName: summary?.profileName ?? null,
        profilePicUrl: summary?.profilePicUrl ?? null,
        number: summaryNumber ?? null,
        providerId: summary?.id ?? providerInstanceId ?? null,
        lastStatusAt: new Date().toISOString()
      } as JsonObject
    });

    return {
      instanceId,
      status,
      number: summaryNumber ?? this.extractPhoneFromMetadata(instance.metadata),
      name: summary?.profileName ?? this.extractNameFromMetadata(instance.metadata),
      qrCode,
      providerStatus: providerState,
      message: state.message ?? null,
      pairingCode: this.extractPairingCodeFromMetadata(instance.metadata)
    };
  }

  async disconnect(userId: string, instanceId: string): Promise<EvolutionSessionResponse> {
    const instance = await this.getOwnedInstance(userId, instanceId);

    try {
      await this.evolutionService.logout(instanceId);
    } catch (error) {
      if (!(error instanceof HttpException && error.getStatus() === 404)) {
        throw error;
      }

      this.logger.warn(`Evolution instance ${instanceId} already missing on provider.`);
    }

    await this.updateInstance(instance, {
      status: 'disconnected',
      connectedAt: null,
      metadata: {
        lastState: 'disconnected',
        lastStatusAt: new Date().toISOString()
      } as JsonObject
    });

    return {
      instanceId,
      status: 'disconnected',
      pairingCode: null
    };
  }

  async removeInstance(userId: string, instanceId: string): Promise<EvolutionSessionResponse> {
    const instance = await this.getOwnedInstance(userId, instanceId);

    await this.safeLogout(instanceId);

    try {
      await this.evolutionService.delete(instanceId);
    } catch (error) {
      if (!(error instanceof HttpException && error.getStatus() === 404)) {
        throw error;
      }
    }

    await this.evolutionModel().delete({
      where: { id: instance.id }
    });

    return {
      instanceId,
      status: 'disconnected',
      pairingCode: null
    };
  }

  async getCurrentSession(userId: string): Promise<EvolutionSessionResponse | null> {
    const current = await this.findLatestInstance(userId);

    if (!current) {
      return null;
    }

    const providerInstanceId = this.resolveProviderInstanceId(current);
    const [state, summary] = await Promise.all([
      this.safeGetState(current.instanceId),
      this.evolutionService.fetchInstance(current.instanceId, providerInstanceId).catch(() => null)
    ]);

    const storedQr = this.readQrFromMetadata(current.metadata);

    if (!state && !summary) {
      await this.updateInstance(current, {
        status: 'disconnected',
        connectedAt: null,
        metadata: {
          lastState: 'unknown',
          lastStatusAt: new Date().toISOString()
        } as JsonObject,
        providerInstanceId: null
      });

      return {
        instanceId: current.instanceId,
        status: 'disconnected',
        qrCode: storedQr
      };
    }

    const providerState =
      state?.instance?.state ?? state?.status ?? summary?.connectionStatus ?? 'unknown';
    const status = this.mapStateToStatus(providerState);
    const summaryNumber = this.extractPhoneFromSummary(summary);
    const requestedNumber =
      this.extractRequestedNumberFromMetadata(current.metadata) ?? summaryNumber ?? null;

    const metadataPatch: JsonObject = {
      lastState: providerState,
      connectionStatus: summary?.connectionStatus ?? null,
      ownerJid: summary?.ownerJid ?? null,
      profileName: summary?.profileName ?? null,
      profilePicUrl: summary?.profilePicUrl ?? null,
      number: summaryNumber ?? requestedNumber ?? null,
      requestedNumber,
      providerId: summary?.id ?? providerInstanceId ?? null,
      lastStatusAt: new Date().toISOString()
    };

    if (status === 'connected') {
      await this.updateInstance(current, {
        status: 'connected',
        connectedAt: current.connectedAt ?? new Date(),
        metadata: metadataPatch,
        providerInstanceId: summary?.id ?? providerInstanceId ?? null
      });

      return {
        instanceId: current.instanceId,
        status: 'connected',
        qrCode: storedQr,
        number: summaryNumber ?? this.extractPhoneFromMetadata(current.metadata) ?? requestedNumber,
        name: summary?.profileName ?? this.extractNameFromMetadata(current.metadata),
        providerStatus: providerState,
        pairingCode: this.extractPairingCodeFromMetadata(current.metadata)
      };
    }

    if (status === 'pending') {
      const qrPayload =
        storedQr ??
        (await this.fetchQr(
          current,
          summary?.id ?? providerInstanceId ?? null,
          requestedNumber ?? summaryNumber ?? null
        ));

      metadataPatch.lastPairingCode = qrPayload?.pairingCode ?? null;
      metadataPatch.requestedNumber = requestedNumber ?? summaryNumber ?? null;

      await this.updateInstance(current, {
        status: 'pending',
        connectedAt: null,
        metadata: metadataPatch,
        providerInstanceId: summary?.id ?? providerInstanceId ?? null
      });

      return {
        instanceId: current.instanceId,
        status: 'pending',
        qrCode: qrPayload,
        number:
          requestedNumber ?? summaryNumber ?? this.extractPhoneFromMetadata(current.metadata),
        name: summary?.profileName ?? this.extractNameFromMetadata(current.metadata),
        providerStatus: providerState,
        message: state?.message ?? null,
        pairingCode: qrPayload?.pairingCode ?? this.extractPairingCodeFromMetadata(current.metadata)
      };
    }

    await this.updateInstance(current, {
      status: 'disconnected',
      connectedAt: null,
      metadata: metadataPatch,
      providerInstanceId: summary?.id ?? providerInstanceId ?? null
    });

    return {
      instanceId: current.instanceId,
      status: 'disconnected',
      qrCode: storedQr,
      number: summaryNumber ?? this.extractPhoneFromMetadata(current.metadata) ?? requestedNumber,
      name: summary?.profileName ?? this.extractNameFromMetadata(current.metadata),
      providerStatus: providerState,
      message: state?.message ?? null,
      pairingCode: this.extractPairingCodeFromMetadata(current.metadata)
    };
  }

  private async findLatestInstance(userId: string) {
    return this.evolutionModel().findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async createFreshSession(
    userId: string,
    phoneNumber?: string
  ): Promise<EvolutionSessionResponse> {
    const created = await this.evolutionService.createInstance(this.buildInstanceName(userId));
    const qrPayload = await this.evolutionService.getQrCode(created.id, phoneNumber ?? undefined);
    const summary = await this.evolutionService
      .fetchInstance(created.id, created.providerId ?? null)
      .catch(() => null);

    const base64 = qrPayload.base64 ?? qrPayload.code ?? null;
    const svg = qrPayload.qrCode ?? null;
    const status = qrPayload.status ?? null;
    const pairingCode = qrPayload.pairingCode ?? null;
    const summaryNumber = this.extractPhoneFromSummary(summary) ?? phoneNumber ?? null;
    const providerInstanceId = summary?.id ?? created.providerId ?? null;

    const metadata: JsonObject = {
      displayName: created.name ?? null,
      lastQrSvg: svg,
      lastQrBase64: base64,
      lastQrStatus: status,
      lastPairingCode: pairingCode,
      lastQrAt: new Date().toISOString(),
      providerId: providerInstanceId,
      token: created.token ?? null,
      rawInstance: created.raw ? (created.raw as JsonObject) : null,
      connectionStatus: summary?.connectionStatus ?? null,
      ownerJid: summary?.ownerJid ?? null,
      profileName: summary?.profileName ?? null,
      profilePicUrl: summary?.profilePicUrl ?? null,
      number: summaryNumber,
      requestedNumber: phoneNumber ?? summaryNumber
    };

    await this.evolutionModel().create({
      data: {
        userId,
        instanceId: created.id,
        providerInstanceId,
        status: 'pending',
        metadata
      }
    });

    return {
      instanceId: created.id,
      status: 'pending',
      qrCode: {
        svg,
        base64,
        status,
        pairingCode,
        count: typeof qrPayload.count === 'number' ? qrPayload.count : null
      },
      number: summaryNumber,
      name: summary?.profileName ?? created.name ?? null,
      pairingCode: pairingCode ?? null
    };
  }

  private async fetchQr(
    instance: EvolutionInstanceRecord,
    providerInstanceId?: string | null,
    phoneNumber?: string | null
  ): Promise<EvolutionQrPayload> {
    const qrPayload = await this.evolutionService.getQrCode(
      instance.instanceId,
      phoneNumber ?? undefined
    );

    const base64 = qrPayload.base64 ?? qrPayload.code ?? null;
    const svg = qrPayload.qrCode ?? null;
    const status = qrPayload.status ?? null;
    const pairingCode = qrPayload.pairingCode ?? null;
    const count = typeof qrPayload.count === 'number' ? qrPayload.count : null;

    await this.updateInstance(instance, {
      status: 'pending',
      metadata: {
        lastQrSvg: svg,
        lastQrBase64: base64,
        lastQrStatus: status,
        lastPairingCode: pairingCode,
        requestedNumber: phoneNumber ?? this.extractRequestedNumberFromMetadata(instance.metadata) ?? null,
        lastQrAt: new Date().toISOString()
      } as JsonObject,
      providerInstanceId: providerInstanceId ?? this.resolveProviderInstanceId(instance)
    });

    return {
      svg,
      base64,
      status,
      pairingCode,
      count
    };
  }

  private async safeGetState(instanceId: string) {
    try {
      return await this.evolutionService.getState(instanceId);
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === 404) {
        this.logger.warn(`Evolution instance ${instanceId} was not found on provider.`);
        return null;
      }

      throw error;
    }
  }

  private async getOwnedInstance(
    userId: string,
    instanceId: string
  ): Promise<EvolutionInstanceRecord> {
    const instance = await this.evolutionModel().findUnique({
      where: { instanceId }
    });

    if (!instance || instance.userId !== userId) {
      throw new NotFoundException('Evolution instance not found.');
    }

    return instance as EvolutionInstanceRecord;
  }

  private async updateInstance(
    instance: EvolutionInstanceRecord,
    payload: {
      status?: string;
      connectedAt?: Date | null;
      metadata?: JsonObject;
      providerInstanceId?: string | null;
    }
  ) {
    const { status, connectedAt, metadata, providerInstanceId } = payload;

    await this.evolutionModel().update({
      where: { id: instance.id },
      data: {
        ...(status ? { status } : {}),
        ...(connectedAt !== undefined ? { connectedAt } : {}),
        ...(metadata
          ? { metadata: this.mergeMetadata(instance.metadata, metadata) }
          : {})
      }
    });
  }

  private mergeMetadata(
    current: JsonValue | null,
    patch: JsonObject
  ): JsonObject {
    const base: JsonObject =
      current && typeof current === 'object' && !Array.isArray(current)
        ? { ...(current as JsonObject) }
        : {};

    return {
      ...base,
      ...patch
    };
  }

  private readQrFromMetadata(metadata: JsonValue | null): EvolutionQrPayload | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    const record = metadata as JsonObject;
    const base64Raw = record['lastQrBase64'];
    const svgRaw = record['lastQrSvg'];
    const statusRaw = record['lastQrStatus'];

    const base64Value =
      typeof base64Raw === 'string' && base64Raw.length > 0 ? (base64Raw as string) : null;
    const svgValue =
      typeof svgRaw === 'string' && svgRaw.length > 0 ? (svgRaw as string) : null;
    const statusValue =
      typeof statusRaw === 'string' && statusRaw.length > 0 ? (statusRaw as string) : 'pending';

    if (!base64Value && !svgValue) {
      return null;
    }

    return {
      base64: base64Value ?? '',
      svg: svgValue ?? '',
      status: statusValue
    };
  }

  private evolutionModel() {
    return (this.prisma as any).evolutionInstance as {
      findFirst: (...args: any[]) => Promise<EvolutionInstanceRecord | null>;
      create: (...args: any[]) => Promise<EvolutionInstanceRecord>;
      findUnique: (...args: any[]) => Promise<EvolutionInstanceRecord | null>;
      update: (...args: any[]) => Promise<EvolutionInstanceRecord>;
      delete: (...args: any[]) => Promise<EvolutionInstanceRecord>;
    };
  }

  private async safeLogout(instanceId: string) {
    try {
      await this.evolutionService.logout(instanceId);
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === 404) {
        return;
      }
      this.logger.warn(`Failed to logout Evolution instance ${instanceId}: ${error}`);
    }
  }

  private resolveProviderInstanceId(instance: EvolutionInstanceRecord): string | null {
    return instance.providerInstanceId ?? this.extractProviderIdFromMetadata(instance.metadata);
  }

  private extractProviderIdFromMetadata(metadata: JsonValue | null): string | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    const record = metadata as JsonObject;
    const providerId = record['providerId'] ?? record['providerInstanceId'];

    return typeof providerId === 'string' && providerId.length > 0 ? providerId : null;
  }

  private extractRequestedNumberFromMetadata(metadata: JsonValue | null): string | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    const record = metadata as JsonObject;
    const requested = record['requestedNumber'] ?? record['number'];

    return typeof requested === 'string' && requested.length > 0 ? requested : null;
  }

  private extractPairingCodeFromMetadata(metadata: JsonValue | null): string | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    const record = metadata as JsonObject;
    const pairing = record['lastPairingCode'];

    return typeof pairing === 'string' && pairing.length > 0 ? pairing : null;
  }

  private extractPhoneFromSummary(summary: EvolutionInstanceSummary | null): string | null {
    if (!summary) {
      return null;
    }

    if (summary.number) {
      return summary.number;
    }

    if (summary.ownerJid) {
      return summary.ownerJid.replace('@s.whatsapp.net', '');
    }

    return null;
  }

  private extractPhoneFromMetadata(metadata: JsonValue | null): string | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    const record = metadata as JsonObject;
    const phone = record['number'];
    const owner = record['ownerJid'];

    if (typeof phone === 'string' && phone.length > 0) {
      return phone;
    }

    if (typeof owner === 'string' && owner.length > 0) {
      return owner.replace('@s.whatsapp.net', '');
    }

    return null;
  }

  private extractNameFromMetadata(metadata: JsonValue | null): string | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return null;
    }

    const record = metadata as JsonObject;
    const name = record['profileName'] ?? record['name'] ?? record['displayName'];

    return typeof name === 'string' && name.length > 0 ? name : null;
  }

  private mapStateToStatus(state: string): 'connected' | 'pending' | 'disconnected' {
    const normalized = state.toLowerCase();

    if (['connected', 'open', 'online', 'ready'].some((value) => normalized.includes(value))) {
      return 'connected';
    }

    if (['connecting', 'pairing', 'initializing', 'pending'].some((value) => normalized.includes(value))) {
      return 'pending';
    }

    return 'disconnected';
  }

  private buildInstanceName(userId: string): string {
    const suffix = userId.slice(-6);
    return `clinic-${suffix}`;
  }
}
