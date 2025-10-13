"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EvolutionIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const evolution_service_1 = require("./evolution.service");
let EvolutionIntegrationService = EvolutionIntegrationService_1 = class EvolutionIntegrationService {
    constructor(prisma, evolutionService) {
        this.prisma = prisma;
        this.evolutionService = evolutionService;
        this.logger = new common_1.Logger(EvolutionIntegrationService_1.name);
    }
    async startSession(userId, phoneNumber) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3;
        const current = await this.findLatestInstance(userId);
        if (current) {
            const providerInstanceId = this.resolveProviderInstanceId(current);
            const [state, summary] = await Promise.all([
                this.safeGetState(current.instanceId),
                this.evolutionService.fetchInstance(current.instanceId, providerInstanceId).catch(() => null)
            ]);
            if (state || summary) {
                const providerState = (_d = (_c = (_b = (_a = state === null || state === void 0 ? void 0 : state.instance) === null || _a === void 0 ? void 0 : _a.state) !== null && _b !== void 0 ? _b : state === null || state === void 0 ? void 0 : state.status) !== null && _c !== void 0 ? _c : summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _d !== void 0 ? _d : 'unknown';
                const status = this.mapStateToStatus(providerState);
                const summaryNumber = this.extractPhoneFromSummary(summary);
                const requestedNumber = (_f = (_e = phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : summaryNumber) !== null && _e !== void 0 ? _e : this.extractRequestedNumberFromMetadata(current.metadata)) !== null && _f !== void 0 ? _f : this.extractPhoneFromMetadata(current.metadata);
                const metadataPatch = {
                    lastState: providerState,
                    connectionStatus: (_g = summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _g !== void 0 ? _g : null,
                    ownerJid: (_h = summary === null || summary === void 0 ? void 0 : summary.ownerJid) !== null && _h !== void 0 ? _h : null,
                    profileName: (_j = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _j !== void 0 ? _j : null,
                    profilePicUrl: (_k = summary === null || summary === void 0 ? void 0 : summary.profilePicUrl) !== null && _k !== void 0 ? _k : null,
                    number: requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : null,
                    requestedNumber: requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : null,
                    providerId: (_m = (_l = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _l !== void 0 ? _l : providerInstanceId) !== null && _m !== void 0 ? _m : null,
                    lastStatusAt: new Date().toISOString()
                };
                if (status === 'connected') {
                    await this.safeLogout(current.instanceId);
                    const qr = await this.fetchQr(current, (_p = (_o = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _o !== void 0 ? _o : providerInstanceId) !== null && _p !== void 0 ? _p : null, requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : null);
                    metadataPatch.lastPairingCode = (_q = qr.pairingCode) !== null && _q !== void 0 ? _q : null;
                    await this.updateInstance(current, {
                        status: 'pending',
                        connectedAt: null,
                        metadata: metadataPatch,
                        providerInstanceId: (_s = (_r = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _r !== void 0 ? _r : providerInstanceId) !== null && _s !== void 0 ? _s : null
                    });
                    return {
                        instanceId: current.instanceId,
                        status: 'pending',
                        qrCode: qr,
                        number: requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : null,
                        name: (_t = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _t !== void 0 ? _t : this.extractNameFromMetadata(current.metadata),
                        providerStatus: providerState,
                        message: (_u = state === null || state === void 0 ? void 0 : state.message) !== null && _u !== void 0 ? _u : null,
                        pairingCode: (_v = qr.pairingCode) !== null && _v !== void 0 ? _v : this.extractPairingCodeFromMetadata(current.metadata)
                    };
                }
                const qr = await this.fetchQr(current, (_x = (_w = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _w !== void 0 ? _w : providerInstanceId) !== null && _x !== void 0 ? _x : null, requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : null);
                metadataPatch.lastPairingCode = (_y = qr.pairingCode) !== null && _y !== void 0 ? _y : null;
                await this.updateInstance(current, {
                    status: 'pending',
                    connectedAt: null,
                    metadata: metadataPatch,
                    providerInstanceId: (_0 = (_z = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _z !== void 0 ? _z : providerInstanceId) !== null && _0 !== void 0 ? _0 : null
                });
                return {
                    instanceId: current.instanceId,
                    status: 'pending',
                    qrCode: qr,
                    number: requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : null,
                    name: (_1 = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _1 !== void 0 ? _1 : this.extractNameFromMetadata(current.metadata),
                    providerStatus: providerState,
                    message: (_2 = state === null || state === void 0 ? void 0 : state.message) !== null && _2 !== void 0 ? _2 : null,
                    pairingCode: (_3 = qr.pairingCode) !== null && _3 !== void 0 ? _3 : this.extractPairingCodeFromMetadata(current.metadata)
                };
            }
            else {
                await this.updateInstance(current, {
                    status: 'disconnected',
                    connectedAt: null,
                    metadata: {
                        lastState: 'unknown',
                        lastStatusAt: new Date().toISOString()
                    }
                });
            }
        }
        return this.createFreshSession(userId, phoneNumber);
    }
    async refreshQr(userId, instanceId, phoneNumber) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const instance = await this.getOwnedInstance(userId, instanceId);
        const providerInstanceId = this.resolveProviderInstanceId(instance);
        const [state, summary] = await Promise.all([
            this.safeGetState(instanceId),
            this.evolutionService.fetchInstance(instanceId, providerInstanceId).catch(() => null)
        ]);
        const providerState = (_d = (_c = (_b = (_a = state === null || state === void 0 ? void 0 : state.instance) === null || _a === void 0 ? void 0 : _a.state) !== null && _b !== void 0 ? _b : state === null || state === void 0 ? void 0 : state.status) !== null && _c !== void 0 ? _c : summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _d !== void 0 ? _d : 'unknown';
        const summaryNumber = this.extractPhoneFromSummary(summary);
        if (providerState === 'connected' || providerState === 'open' || providerState === 'pending') {
            await this.safeLogout(instanceId);
        }
        const metadataPatch = {
            lastState: providerState,
            connectionStatus: (_e = summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _e !== void 0 ? _e : null,
            ownerJid: (_f = summary === null || summary === void 0 ? void 0 : summary.ownerJid) !== null && _f !== void 0 ? _f : null,
            profileName: (_g = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _g !== void 0 ? _g : null,
            profilePicUrl: (_h = summary === null || summary === void 0 ? void 0 : summary.profilePicUrl) !== null && _h !== void 0 ? _h : null,
            number: summaryNumber !== null && summaryNumber !== void 0 ? summaryNumber : null,
            providerId: (_k = (_j = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _j !== void 0 ? _j : providerInstanceId) !== null && _k !== void 0 ? _k : null,
            lastStatusAt: new Date().toISOString()
        };
        const qr = await this.fetchQr(instance, (_m = (_l = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _l !== void 0 ? _l : providerInstanceId) !== null && _m !== void 0 ? _m : null, (_o = phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : summaryNumber) !== null && _o !== void 0 ? _o : null);
        await this.updateInstance(instance, {
            status: 'pending',
            connectedAt: null,
            metadata: metadataPatch,
            providerInstanceId: (_q = (_p = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _p !== void 0 ? _p : providerInstanceId) !== null && _q !== void 0 ? _q : null
        });
        return {
            instanceId,
            status: 'pending',
            qrCode: qr,
            number: summaryNumber !== null && summaryNumber !== void 0 ? summaryNumber : this.extractPhoneFromMetadata(instance.metadata),
            name: (_r = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _r !== void 0 ? _r : this.extractNameFromMetadata(instance.metadata),
            providerStatus: providerState
        };
    }
    async getStatus(userId, instanceId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const instance = await this.getOwnedInstance(userId, instanceId);
        const providerInstanceId = this.resolveProviderInstanceId(instance);
        const [state, summary] = await Promise.all([
            this.evolutionService.getState(instanceId),
            this.evolutionService.fetchInstance(instanceId, providerInstanceId).catch(() => null)
        ]);
        const providerState = (_d = (_c = (_b = (_a = state.instance) === null || _a === void 0 ? void 0 : _a.state) !== null && _b !== void 0 ? _b : state.status) !== null && _c !== void 0 ? _c : summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _d !== void 0 ? _d : 'unknown';
        const status = this.mapStateToStatus(providerState);
        const storedQr = this.readQrFromMetadata(instance.metadata);
        const summaryNumber = this.extractPhoneFromSummary(summary);
        const connectedAt = status === 'connected'
            ? (_e = instance.connectedAt) !== null && _e !== void 0 ? _e : new Date()
            : status === 'disconnected'
                ? null
                : (_f = instance.connectedAt) !== null && _f !== void 0 ? _f : null;
        let qrCode = null;
        if (status === 'pending') {
            qrCode = storedQr !== null && storedQr !== void 0 ? storedQr : (await this.fetchQr(instance, (_h = (_g = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _g !== void 0 ? _g : providerInstanceId) !== null && _h !== void 0 ? _h : null));
        }
        await this.updateInstance(instance, {
            status,
            connectedAt,
            metadata: {
                lastState: providerState,
                connectionStatus: (_j = summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _j !== void 0 ? _j : null,
                ownerJid: (_k = summary === null || summary === void 0 ? void 0 : summary.ownerJid) !== null && _k !== void 0 ? _k : null,
                profileName: (_l = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _l !== void 0 ? _l : null,
                profilePicUrl: (_m = summary === null || summary === void 0 ? void 0 : summary.profilePicUrl) !== null && _m !== void 0 ? _m : null,
                number: summaryNumber !== null && summaryNumber !== void 0 ? summaryNumber : null,
                providerId: (_p = (_o = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _o !== void 0 ? _o : providerInstanceId) !== null && _p !== void 0 ? _p : null,
                lastStatusAt: new Date().toISOString()
            }
        });
        return {
            instanceId,
            status,
            number: summaryNumber !== null && summaryNumber !== void 0 ? summaryNumber : this.extractPhoneFromMetadata(instance.metadata),
            name: (_q = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _q !== void 0 ? _q : this.extractNameFromMetadata(instance.metadata),
            qrCode,
            providerStatus: providerState,
            message: (_r = state.message) !== null && _r !== void 0 ? _r : null,
            pairingCode: this.extractPairingCodeFromMetadata(instance.metadata)
        };
    }
    async disconnect(userId, instanceId) {
        const instance = await this.getOwnedInstance(userId, instanceId);
        try {
            await this.evolutionService.logout(instanceId);
        }
        catch (error) {
            if (!(error instanceof common_1.HttpException && error.getStatus() === 404)) {
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
            }
        });
        return {
            instanceId,
            status: 'disconnected',
            pairingCode: null
        };
    }
    async removeInstance(userId, instanceId) {
        const instance = await this.getOwnedInstance(userId, instanceId);
        await this.safeLogout(instanceId);
        try {
            await this.evolutionService.delete(instanceId);
        }
        catch (error) {
            if (!(error instanceof common_1.HttpException && error.getStatus() === 404)) {
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
    async getCurrentSession(userId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
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
                },
                providerInstanceId: null
            });
            return {
                instanceId: current.instanceId,
                status: 'disconnected',
                qrCode: storedQr
            };
        }
        const providerState = (_d = (_c = (_b = (_a = state === null || state === void 0 ? void 0 : state.instance) === null || _a === void 0 ? void 0 : _a.state) !== null && _b !== void 0 ? _b : state === null || state === void 0 ? void 0 : state.status) !== null && _c !== void 0 ? _c : summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _d !== void 0 ? _d : 'unknown';
        const status = this.mapStateToStatus(providerState);
        const summaryNumber = this.extractPhoneFromSummary(summary);
        const requestedNumber = (_f = (_e = this.extractRequestedNumberFromMetadata(current.metadata)) !== null && _e !== void 0 ? _e : summaryNumber) !== null && _f !== void 0 ? _f : null;
        const metadataPatch = {
            lastState: providerState,
            connectionStatus: (_g = summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _g !== void 0 ? _g : null,
            ownerJid: (_h = summary === null || summary === void 0 ? void 0 : summary.ownerJid) !== null && _h !== void 0 ? _h : null,
            profileName: (_j = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _j !== void 0 ? _j : null,
            profilePicUrl: (_k = summary === null || summary === void 0 ? void 0 : summary.profilePicUrl) !== null && _k !== void 0 ? _k : null,
            number: (_l = summaryNumber !== null && summaryNumber !== void 0 ? summaryNumber : requestedNumber) !== null && _l !== void 0 ? _l : null,
            requestedNumber,
            providerId: (_o = (_m = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _m !== void 0 ? _m : providerInstanceId) !== null && _o !== void 0 ? _o : null,
            lastStatusAt: new Date().toISOString()
        };
        if (status === 'connected') {
            await this.updateInstance(current, {
                status: 'connected',
                connectedAt: (_p = current.connectedAt) !== null && _p !== void 0 ? _p : new Date(),
                metadata: metadataPatch,
                providerInstanceId: (_r = (_q = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _q !== void 0 ? _q : providerInstanceId) !== null && _r !== void 0 ? _r : null
            });
            return {
                instanceId: current.instanceId,
                status: 'connected',
                qrCode: storedQr,
                number: (_s = summaryNumber !== null && summaryNumber !== void 0 ? summaryNumber : this.extractPhoneFromMetadata(current.metadata)) !== null && _s !== void 0 ? _s : requestedNumber,
                name: (_t = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _t !== void 0 ? _t : this.extractNameFromMetadata(current.metadata),
                providerStatus: providerState,
                pairingCode: this.extractPairingCodeFromMetadata(current.metadata)
            };
        }
        if (status === 'pending') {
            const qrPayload = storedQr !== null && storedQr !== void 0 ? storedQr : (await this.fetchQr(current, (_v = (_u = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _u !== void 0 ? _u : providerInstanceId) !== null && _v !== void 0 ? _v : null, (_w = requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : summaryNumber) !== null && _w !== void 0 ? _w : null));
            metadataPatch.lastPairingCode = (_x = qrPayload === null || qrPayload === void 0 ? void 0 : qrPayload.pairingCode) !== null && _x !== void 0 ? _x : null;
            metadataPatch.requestedNumber = (_y = requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : summaryNumber) !== null && _y !== void 0 ? _y : null;
            await this.updateInstance(current, {
                status: 'pending',
                connectedAt: null,
                metadata: metadataPatch,
                providerInstanceId: (_0 = (_z = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _z !== void 0 ? _z : providerInstanceId) !== null && _0 !== void 0 ? _0 : null
            });
            return {
                instanceId: current.instanceId,
                status: 'pending',
                qrCode: qrPayload,
                number: (_1 = requestedNumber !== null && requestedNumber !== void 0 ? requestedNumber : summaryNumber) !== null && _1 !== void 0 ? _1 : this.extractPhoneFromMetadata(current.metadata),
                name: (_2 = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _2 !== void 0 ? _2 : this.extractNameFromMetadata(current.metadata),
                providerStatus: providerState,
                message: (_3 = state === null || state === void 0 ? void 0 : state.message) !== null && _3 !== void 0 ? _3 : null,
                pairingCode: (_4 = qrPayload === null || qrPayload === void 0 ? void 0 : qrPayload.pairingCode) !== null && _4 !== void 0 ? _4 : this.extractPairingCodeFromMetadata(current.metadata)
            };
        }
        await this.updateInstance(current, {
            status: 'disconnected',
            connectedAt: null,
            metadata: metadataPatch,
            providerInstanceId: (_6 = (_5 = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _5 !== void 0 ? _5 : providerInstanceId) !== null && _6 !== void 0 ? _6 : null
        });
        return {
            instanceId: current.instanceId,
            status: 'disconnected',
            qrCode: storedQr,
            number: (_7 = summaryNumber !== null && summaryNumber !== void 0 ? summaryNumber : this.extractPhoneFromMetadata(current.metadata)) !== null && _7 !== void 0 ? _7 : requestedNumber,
            name: (_8 = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _8 !== void 0 ? _8 : this.extractNameFromMetadata(current.metadata),
            providerStatus: providerState,
            message: (_9 = state === null || state === void 0 ? void 0 : state.message) !== null && _9 !== void 0 ? _9 : null,
            pairingCode: this.extractPairingCodeFromMetadata(current.metadata)
        };
    }
    async findLatestInstance(userId) {
        return this.evolutionModel().findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async createFreshSession(userId, phoneNumber) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const created = await this.evolutionService.createInstance(this.buildInstanceName(userId));
        const qrPayload = await this.evolutionService.getQrCode(created.id, phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : undefined);
        const summary = await this.evolutionService
            .fetchInstance(created.id, (_a = created.providerId) !== null && _a !== void 0 ? _a : null)
            .catch(() => null);
        const base64 = (_c = (_b = qrPayload.base64) !== null && _b !== void 0 ? _b : qrPayload.code) !== null && _c !== void 0 ? _c : null;
        const svg = (_d = qrPayload.qrCode) !== null && _d !== void 0 ? _d : null;
        const status = (_e = qrPayload.status) !== null && _e !== void 0 ? _e : null;
        const pairingCode = (_f = qrPayload.pairingCode) !== null && _f !== void 0 ? _f : null;
        const summaryNumber = (_h = (_g = this.extractPhoneFromSummary(summary)) !== null && _g !== void 0 ? _g : phoneNumber) !== null && _h !== void 0 ? _h : null;
        const providerInstanceId = (_k = (_j = summary === null || summary === void 0 ? void 0 : summary.id) !== null && _j !== void 0 ? _j : created.providerId) !== null && _k !== void 0 ? _k : null;
        const metadata = {
            displayName: (_l = created.name) !== null && _l !== void 0 ? _l : null,
            lastQrSvg: svg,
            lastQrBase64: base64,
            lastQrStatus: status,
            lastPairingCode: pairingCode,
            lastQrAt: new Date().toISOString(),
            providerId: providerInstanceId,
            token: (_m = created.token) !== null && _m !== void 0 ? _m : null,
            rawInstance: created.raw ? created.raw : null,
            connectionStatus: (_o = summary === null || summary === void 0 ? void 0 : summary.connectionStatus) !== null && _o !== void 0 ? _o : null,
            ownerJid: (_p = summary === null || summary === void 0 ? void 0 : summary.ownerJid) !== null && _p !== void 0 ? _p : null,
            profileName: (_q = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _q !== void 0 ? _q : null,
            profilePicUrl: (_r = summary === null || summary === void 0 ? void 0 : summary.profilePicUrl) !== null && _r !== void 0 ? _r : null,
            number: summaryNumber,
            requestedNumber: phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : summaryNumber
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
            name: (_t = (_s = summary === null || summary === void 0 ? void 0 : summary.profileName) !== null && _s !== void 0 ? _s : created.name) !== null && _t !== void 0 ? _t : null,
            pairingCode: pairingCode !== null && pairingCode !== void 0 ? pairingCode : null
        };
    }
    async fetchQr(instance, providerInstanceId, phoneNumber) {
        var _a, _b, _c, _d, _e, _f;
        const qrPayload = await this.evolutionService.getQrCode(instance.instanceId, phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : undefined);
        const base64 = (_b = (_a = qrPayload.base64) !== null && _a !== void 0 ? _a : qrPayload.code) !== null && _b !== void 0 ? _b : null;
        const svg = (_c = qrPayload.qrCode) !== null && _c !== void 0 ? _c : null;
        const status = (_d = qrPayload.status) !== null && _d !== void 0 ? _d : null;
        const pairingCode = (_e = qrPayload.pairingCode) !== null && _e !== void 0 ? _e : null;
        const count = typeof qrPayload.count === 'number' ? qrPayload.count : null;
        await this.updateInstance(instance, {
            status: 'pending',
            metadata: {
                lastQrSvg: svg,
                lastQrBase64: base64,
                lastQrStatus: status,
                lastPairingCode: pairingCode,
                requestedNumber: (_f = phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : this.extractRequestedNumberFromMetadata(instance.metadata)) !== null && _f !== void 0 ? _f : null,
                lastQrAt: new Date().toISOString()
            },
            providerInstanceId: providerInstanceId !== null && providerInstanceId !== void 0 ? providerInstanceId : this.resolveProviderInstanceId(instance)
        });
        return {
            svg,
            base64,
            status,
            pairingCode,
            count
        };
    }
    async safeGetState(instanceId) {
        try {
            return await this.evolutionService.getState(instanceId);
        }
        catch (error) {
            if (error instanceof common_1.HttpException && error.getStatus() === 404) {
                this.logger.warn(`Evolution instance ${instanceId} was not found on provider.`);
                return null;
            }
            throw error;
        }
    }
    async getOwnedInstance(userId, instanceId) {
        const instance = await this.evolutionModel().findUnique({
            where: { instanceId }
        });
        if (!instance || instance.userId !== userId) {
            throw new common_1.NotFoundException('Evolution instance not found.');
        }
        return instance;
    }
    async updateInstance(instance, payload) {
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
    mergeMetadata(current, patch) {
        const base = current && typeof current === 'object' && !Array.isArray(current)
            ? { ...current }
            : {};
        return {
            ...base,
            ...patch
        };
    }
    readQrFromMetadata(metadata) {
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        const record = metadata;
        const base64Raw = record['lastQrBase64'];
        const svgRaw = record['lastQrSvg'];
        const statusRaw = record['lastQrStatus'];
        const base64Value = typeof base64Raw === 'string' && base64Raw.length > 0 ? base64Raw : null;
        const svgValue = typeof svgRaw === 'string' && svgRaw.length > 0 ? svgRaw : null;
        const statusValue = typeof statusRaw === 'string' && statusRaw.length > 0 ? statusRaw : 'pending';
        if (!base64Value && !svgValue) {
            return null;
        }
        return {
            base64: base64Value !== null && base64Value !== void 0 ? base64Value : '',
            svg: svgValue !== null && svgValue !== void 0 ? svgValue : '',
            status: statusValue
        };
    }
    evolutionModel() {
        return this.prisma.evolutionInstance;
    }
    async safeLogout(instanceId) {
        try {
            await this.evolutionService.logout(instanceId);
        }
        catch (error) {
            if (error instanceof common_1.HttpException && error.getStatus() === 404) {
                return;
            }
            this.logger.warn(`Failed to logout Evolution instance ${instanceId}: ${error}`);
        }
    }
    resolveProviderInstanceId(instance) {
        var _a;
        return (_a = instance.providerInstanceId) !== null && _a !== void 0 ? _a : this.extractProviderIdFromMetadata(instance.metadata);
    }
    extractProviderIdFromMetadata(metadata) {
        var _a;
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        const record = metadata;
        const providerId = (_a = record['providerId']) !== null && _a !== void 0 ? _a : record['providerInstanceId'];
        return typeof providerId === 'string' && providerId.length > 0 ? providerId : null;
    }
    extractRequestedNumberFromMetadata(metadata) {
        var _a;
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        const record = metadata;
        const requested = (_a = record['requestedNumber']) !== null && _a !== void 0 ? _a : record['number'];
        return typeof requested === 'string' && requested.length > 0 ? requested : null;
    }
    extractPairingCodeFromMetadata(metadata) {
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        const record = metadata;
        const pairing = record['lastPairingCode'];
        return typeof pairing === 'string' && pairing.length > 0 ? pairing : null;
    }
    extractPhoneFromSummary(summary) {
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
    extractPhoneFromMetadata(metadata) {
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        const record = metadata;
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
    extractNameFromMetadata(metadata) {
        var _a, _b;
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return null;
        }
        const record = metadata;
        const name = (_b = (_a = record['profileName']) !== null && _a !== void 0 ? _a : record['name']) !== null && _b !== void 0 ? _b : record['displayName'];
        return typeof name === 'string' && name.length > 0 ? name : null;
    }
    mapStateToStatus(state) {
        const normalized = state.toLowerCase();
        if (['connected', 'open', 'online', 'ready'].some((value) => normalized.includes(value))) {
            return 'connected';
        }
        if (['connecting', 'pairing', 'initializing', 'pending'].some((value) => normalized.includes(value))) {
            return 'pending';
        }
        return 'disconnected';
    }
    buildInstanceName(userId) {
        const suffix = userId.slice(-6);
        return `clinic-${suffix}`;
    }
};
exports.EvolutionIntegrationService = EvolutionIntegrationService;
exports.EvolutionIntegrationService = EvolutionIntegrationService = EvolutionIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        evolution_service_1.EvolutionService])
], EvolutionIntegrationService);
//# sourceMappingURL=evolution-integration.service.js.map