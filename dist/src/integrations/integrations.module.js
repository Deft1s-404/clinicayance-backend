"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsModule = void 0;
const common_1 = require("@nestjs/common");
const clients_module_1 = require("../clients/clients.module");
const leads_module_1 = require("../leads/leads.module");
const integrations_controller_1 = require("./integrations.controller");
const integrations_service_1 = require("./integrations.service");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [clients_module_1.ClientsModule, leads_module_1.LeadsModule],
        controllers: [integrations_controller_1.IntegrationsController],
        providers: [integrations_service_1.IntegrationsService]
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map