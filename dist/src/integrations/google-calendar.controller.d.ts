import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarCreateEventDto, GoogleCalendarDeleteEventDto, GoogleCalendarGetEventQueryDto, GoogleCalendarListEventsDto, GoogleCalendarUpdateEventDto } from './dto/google-calendar-event.dto';
type AuthenticatedUser = {
    userId: string;
    email: string;
};
export declare class GoogleCalendarController {
    private readonly googleCalendarService;
    constructor(googleCalendarService: GoogleCalendarService);
    listEvents(user: AuthenticatedUser, query: GoogleCalendarListEventsDto): Promise<import("googleapis").calendar_v3.Schema$Events>;
    getEvent(user: AuthenticatedUser, eventId: string, query: GoogleCalendarGetEventQueryDto): Promise<import("googleapis").calendar_v3.Schema$Event>;
    createEvent(user: AuthenticatedUser, dto: GoogleCalendarCreateEventDto): Promise<import("googleapis").calendar_v3.Schema$Event>;
    updateEvent(user: AuthenticatedUser, eventId: string, dto: GoogleCalendarUpdateEventDto): Promise<import("googleapis").calendar_v3.Schema$Event>;
    deleteEvent(user: AuthenticatedUser, eventId: string, dto: GoogleCalendarDeleteEventDto): Promise<{
        message: string;
    }>;
}
export {};
