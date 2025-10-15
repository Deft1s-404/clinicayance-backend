"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const appointments_module_1 = require("./appointments/appointments.module");
const auth_module_1 = require("./auth/auth.module");
const campaigns_module_1 = require("./campaigns/campaigns.module");
const clients_module_1 = require("./clients/clients.module");
const common_module_1 = require("./common/common.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const funnel_events_module_1 = require("./funnel-events/funnel-events.module");
const integrations_module_1 = require("./integrations/integrations.module");
const leads_module_1 = require("./leads/leads.module");
const payments_module_1 = require("./payments/payments.module");
const prisma_module_1 = require("./prisma/prisma.module");
const reports_module_1 = require("./reports/reports.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            clients_module_1.ClientsModule,
            leads_module_1.LeadsModule,
            appointments_module_1.AppointmentsModule,
            payments_module_1.PaymentsModule,
            campaigns_module_1.CampaignsModule,
            reports_module_1.ReportsModule,
            funnel_events_module_1.FunnelEventsModule,
            integrations_module_1.IntegrationsModule,
            common_module_1.CommonModule
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard
            }
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map