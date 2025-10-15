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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const evolution_integration_service_1 = require("./evolution-integration.service");
const evolution_generate_qr_dto_1 = require("./dto/evolution-generate-qr.dto");
const evolution_create_instance_dto_1 = require("./dto/evolution-create-instance.dto");
let EvolutionController = class EvolutionController {
    constructor(evolutionIntegrationService) {
        this.evolutionIntegrationService = evolutionIntegrationService;
    }
    getCurrent(user) {
        return this.evolutionIntegrationService.getCurrentSession(user.userId);
    }
    listInstances(user) {
        return this.evolutionIntegrationService.listManagedInstances(user.userId);
    }
    startSession(user, dto) {
        return this.evolutionIntegrationService.startSession(user.userId, dto.number);
    }
    createInstance(user, dto) {
        return this.evolutionIntegrationService.createManagedInstance(user.userId, dto.instanceName, dto.webhookUrl, dto.slotId);
    }
    refreshQr(user, instanceId, dto) {
        return this.evolutionIntegrationService.refreshQr(user.userId, instanceId, dto.number);
    }
    getStatus(user, instanceId) {
        return this.evolutionIntegrationService.getStatus(user.userId, instanceId);
    }
    disconnect(user, instanceId) {
        return this.evolutionIntegrationService.disconnect(user.userId, instanceId);
    }
    removeInstance(user, instanceId) {
        return this.evolutionIntegrationService.removeInstance(user.userId, instanceId);
    }
};
exports.EvolutionController = EvolutionController;
__decorate([
    (0, common_1.Get)('instances'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Get)('instances/list'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "listInstances", null);
__decorate([
    (0, common_1.Post)('instances'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, evolution_generate_qr_dto_1.EvolutionGenerateQrDto]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "startSession", null);
__decorate([
    (0, common_1.Post)('instances/create'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, evolution_create_instance_dto_1.EvolutionCreateInstanceDto]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "createInstance", null);
__decorate([
    (0, common_1.Post)('instances/:instanceId/qr'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('instanceId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, evolution_generate_qr_dto_1.EvolutionGenerateQrDto]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "refreshQr", null);
__decorate([
    (0, common_1.Get)('instances/:instanceId/status'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Delete)('instances/:instanceId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Delete)('instances/:instanceId/remove'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('instanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EvolutionController.prototype, "removeInstance", null);
exports.EvolutionController = EvolutionController = __decorate([
    (0, common_1.Controller)('integrations/evolution'),
    __metadata("design:paramtypes", [evolution_integration_service_1.EvolutionIntegrationService])
], EvolutionController);
//# sourceMappingURL=evolution.controller.js.map