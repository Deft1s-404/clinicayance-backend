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
        var _a, _b, _c, _d, _e, _f, _g, _h;
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
            score,
            age: (_e = dto.age) !== null && _e !== void 0 ? _e : undefined,
            country: (_f = dto.country) !== null && _f !== void 0 ? _f : undefined,
            birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
            language: (_g = dto.language) !== null && _g !== void 0 ? _g : undefined,
            intimateAssessmentPhotos: (_h = dto.intimateAssessmentPhotos) !== null && _h !== void 0 ? _h : [],
            anamnesisResponses: dto.anamnesisResponses
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
        const updateData = {
            tags: (_e = dto.tags) !== null && _e !== void 0 ? _e : client.tags,
            score
        };
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.email !== undefined)
            updateData.email = dto.email;
        if (dto.phone !== undefined)
            updateData.phone = dto.phone;
        if (dto.source !== undefined)
            updateData.source = dto.source;
        if (dto.notes !== undefined)
            updateData.notes = dto.notes;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.age !== undefined)
            updateData.age = dto.age;
        if (dto.country !== undefined)
            updateData.country = dto.country;
        if (dto.birthDate !== undefined)
            updateData.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
        if (dto.language !== undefined)
            updateData.language = dto.language;
        if (dto.intimateAssessmentPhotos !== undefined)
            updateData.intimateAssessmentPhotos = dto.intimateAssessmentPhotos;
        if (dto.anamnesisResponses !== undefined)
            updateData.anamnesisResponses = dto.anamnesisResponses;
        return this.clientsRepository.update(id, updateData);
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