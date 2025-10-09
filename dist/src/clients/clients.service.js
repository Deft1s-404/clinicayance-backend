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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const lead_scoring_util_1 = require("../common/utils/lead-scoring.util");
const clients_repository_1 = require("./clients.repository");
let ClientsService = class ClientsService {
    constructor(clientsRepository) {
        this.clientsRepository = clientsRepository;
    }
    list(query) {
        return this.clientsRepository.findMany(query);
    }
    async findById(id) {
        const client = await this.clientsRepository.findById(id);
        if (!client) {
            throw new common_1.NotFoundException('Cliente nao encontrado');
        }
        return client;
    }
    findByEmail(email) {
        return this.clientsRepository.findByEmail(email);
    }
    findByPhone(phone) {
        return this.clientsRepository.findByPhone(phone);
    }
    async create(dto) {
        var _a, _b, _c, _d;
        const score = (0, lead_scoring_util_1.calculateLeadScore)({
            source: dto.source,
            tags: (_a = dto.tags) !== null && _a !== void 0 ? _a : [],
            status: (_b = dto.status) !== null && _b !== void 0 ? _b : client_1.ClientStatus.NEW
        });
        return this.clientsRepository.create({
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            source: dto.source,
            tags: (_c = dto.tags) !== null && _c !== void 0 ? _c : [],
            notes: dto.notes,
            status: (_d = dto.status) !== null && _d !== void 0 ? _d : client_1.ClientStatus.NEW,
            score
        });
    }
    async update(id, dto) {
        var _a, _b, _c, _d, _e;
        const client = await this.findById(id);
        const score = (0, lead_scoring_util_1.calculateLeadScore)({
            source: (_b = (_a = dto.source) !== null && _a !== void 0 ? _a : client.source) !== null && _b !== void 0 ? _b : undefined,
            tags: (_c = dto.tags) !== null && _c !== void 0 ? _c : client.tags,
            status: (_d = dto.status) !== null && _d !== void 0 ? _d : client.status
        });
        return this.clientsRepository.update(id, {
            ...dto,
            tags: (_e = dto.tags) !== null && _e !== void 0 ? _e : client.tags,
            score
        });
    }
    async delete(id) {
        await this.findById(id);
        return this.clientsRepository.delete(id);
    }
    updateScore(id, score) {
        return this.clientsRepository.update(id, { score });
    }
};
exports.ClientsService = ClientsService;
exports.ClientsService = ClientsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [clients_repository_1.ClientsRepository])
], ClientsService);
//# sourceMappingURL=clients.service.js.map