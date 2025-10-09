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
exports.GoogleCalendarDeleteEventDto = exports.GoogleCalendarGetEventQueryDto = exports.GoogleCalendarListEventsDto = exports.GoogleCalendarUpdateEventDto = exports.GoogleCalendarCreateEventDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class GoogleCalendarDateTimeDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GoogleCalendarDateTimeDto.prototype, "dateTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarDateTimeDto.prototype, "timeZone", void 0);
class GoogleCalendarAttendeeDto {
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], GoogleCalendarAttendeeDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarAttendeeDto.prototype, "displayName", void 0);
class GoogleCalendarCreateEventDto {
}
exports.GoogleCalendarCreateEventDto = GoogleCalendarCreateEventDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarCreateEventDto.prototype, "calendarId", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GoogleCalendarDateTimeDto),
    __metadata("design:type", GoogleCalendarDateTimeDto)
], GoogleCalendarCreateEventDto.prototype, "start", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GoogleCalendarDateTimeDto),
    __metadata("design:type", GoogleCalendarDateTimeDto)
], GoogleCalendarCreateEventDto.prototype, "end", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarCreateEventDto.prototype, "summary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarCreateEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GoogleCalendarAttendeeDto),
    __metadata("design:type", Array)
], GoogleCalendarCreateEventDto.prototype, "attendees", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarCreateEventDto.prototype, "location", void 0);
class GoogleCalendarUpdateEventDto {
}
exports.GoogleCalendarUpdateEventDto = GoogleCalendarUpdateEventDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarUpdateEventDto.prototype, "calendarId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GoogleCalendarDateTimeDto),
    __metadata("design:type", GoogleCalendarDateTimeDto)
], GoogleCalendarUpdateEventDto.prototype, "start", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GoogleCalendarDateTimeDto),
    __metadata("design:type", GoogleCalendarDateTimeDto)
], GoogleCalendarUpdateEventDto.prototype, "end", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarUpdateEventDto.prototype, "summary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarUpdateEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => GoogleCalendarAttendeeDto),
    __metadata("design:type", Array)
], GoogleCalendarUpdateEventDto.prototype, "attendees", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarUpdateEventDto.prototype, "location", void 0);
class GoogleCalendarListEventsDto {
}
exports.GoogleCalendarListEventsDto = GoogleCalendarListEventsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarListEventsDto.prototype, "calendarId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GoogleCalendarListEventsDto.prototype, "timeMin", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GoogleCalendarListEventsDto.prototype, "timeMax", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarListEventsDto.prototype, "pageToken", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarListEventsDto.prototype, "syncToken", void 0);
class GoogleCalendarGetEventQueryDto {
}
exports.GoogleCalendarGetEventQueryDto = GoogleCalendarGetEventQueryDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarGetEventQueryDto.prototype, "calendarId", void 0);
class GoogleCalendarDeleteEventDto {
}
exports.GoogleCalendarDeleteEventDto = GoogleCalendarDeleteEventDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GoogleCalendarDeleteEventDto.prototype, "calendarId", void 0);
//# sourceMappingURL=google-calendar-event.dto.js.map