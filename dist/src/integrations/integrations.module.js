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
const prisma_module_1 = require("../prisma/prisma.module");
const integrations_controller_1 = require("./integrations.controller");
const integrations_service_1 = require("./integrations.service");
const google_oauth_controller_1 = require("./google-oauth.controller");
const google_oauth_service_1 = require("./google-oauth.service");
const google_calendar_service_1 = require("./google-calendar.service");
const google_calendar_controller_1 = require("./google-calendar.controller");
const evolution_service_1 = require("./evolution.service");
const evolution_integration_service_1 = require("./evolution-integration.service");
const evolution_controller_1 = require("./evolution.controller");
let IntegrationsModule = class IntegrationsModule {
};
exports.IntegrationsModule = IntegrationsModule;
exports.IntegrationsModule = IntegrationsModule = __decorate([
    (0, common_1.Module)({
        imports: [clients_module_1.ClientsModule, leads_module_1.LeadsModule, prisma_module_1.PrismaModule],
        controllers: [
            integrations_controller_1.IntegrationsController,
            google_oauth_controller_1.GoogleOAuthController,
            google_calendar_controller_1.GoogleCalendarController,
            evolution_controller_1.EvolutionController
        ],
        providers: [
            integrations_service_1.IntegrationsService,
            google_oauth_service_1.GoogleOAuthService,
            google_calendar_service_1.GoogleCalendarService,
            evolution_service_1.EvolutionService,
            evolution_integration_service_1.EvolutionIntegrationService
        ]
    })
], IntegrationsModule);
//# sourceMappingURL=integrations.module.js.map