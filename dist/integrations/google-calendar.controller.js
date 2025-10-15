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
exports.GoogleCalendarController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const google_calendar_service_1 = require("./google-calendar.service");
const google_calendar_event_dto_1 = require("./dto/google-calendar-event.dto");
let GoogleCalendarController = class GoogleCalendarController {
    constructor(googleCalendarService) {
        this.googleCalendarService = googleCalendarService;
    }
    async listEvents(user, query) {
        return this.googleCalendarService.listEvents(user.userId, {
            calendarId: query.calendarId,
            timeMin: query.timeMin,
            timeMax: query.timeMax,
            pageToken: query.pageToken,
            syncToken: query.syncToken,
            singleEvents: true,
            orderBy: 'startTime'
        });
    }
    async getEvent(user, eventId, query) {
        return this.googleCalendarService.getEvent(user.userId, {
            calendarId: query.calendarId,
            eventId
        });
    }
    async createEvent(user, dto) {
        return this.googleCalendarService.insertEvent(user.userId, {
            calendarId: dto.calendarId,
            requestBody: {
                start: dto.start,
                end: dto.end,
                summary: dto.summary,
                description: dto.description,
                attendees: dto.attendees,
                location: dto.location
            }
        });
    }
    async updateEvent(user, eventId, dto) {
        return this.googleCalendarService.patchEvent(user.userId, {
            calendarId: dto.calendarId,
            eventId,
            requestBody: {
                start: dto.start,
                end: dto.end,
                summary: dto.summary,
                description: dto.description,
                attendees: dto.attendees,
                location: dto.location
            }
        });
    }
    async deleteEvent(user, eventId, dto) {
        await this.googleCalendarService.deleteEvent(user.userId, {
            calendarId: dto.calendarId,
            eventId
        });
        return {
            message: 'Evento removido com sucesso.'
        };
    }
};
exports.GoogleCalendarController = GoogleCalendarController;
__decorate([
    (0, common_1.Get)('events'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, google_calendar_event_dto_1.GoogleCalendarListEventsDto]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "listEvents", null);
__decorate([
    (0, common_1.Get)('events/:eventId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, google_calendar_event_dto_1.GoogleCalendarGetEventQueryDto]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, google_calendar_event_dto_1.GoogleCalendarCreateEventDto]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Patch)('events/:eventId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, google_calendar_event_dto_1.GoogleCalendarUpdateEventDto]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:eventId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, google_calendar_event_dto_1.GoogleCalendarDeleteEventDto]),
    __metadata("design:returntype", Promise)
], GoogleCalendarController.prototype, "deleteEvent", null);
exports.GoogleCalendarController = GoogleCalendarController = __decorate([
    (0, common_1.Controller)('google/calendar'),
    __metadata("design:paramtypes", [google_calendar_service_1.GoogleCalendarService])
], GoogleCalendarController);
//# sourceMappingURL=google-calendar.controller.js.map