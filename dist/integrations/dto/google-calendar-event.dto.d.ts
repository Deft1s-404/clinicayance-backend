declare class GoogleCalendarDateTimeDto {
    dateTime: string;
    timeZone?: string;
}
declare class GoogleCalendarAttendeeDto {
    email: string;
    displayName?: string;
}
export declare class GoogleCalendarCreateEventDto {
    calendarId: string;
    start: GoogleCalendarDateTimeDto;
    end: GoogleCalendarDateTimeDto;
    summary?: string;
    description?: string;
    attendees?: GoogleCalendarAttendeeDto[];
    location?: string;
}
export declare class GoogleCalendarUpdateEventDto {
    calendarId: string;
    start?: GoogleCalendarDateTimeDto;
    end?: GoogleCalendarDateTimeDto;
    summary?: string;
    description?: string;
    attendees?: GoogleCalendarAttendeeDto[];
    location?: string;
}
export declare class GoogleCalendarListEventsDto {
    calendarId: string;
    timeMin?: string;
    timeMax?: string;
    pageToken?: string;
    syncToken?: string;
}
export declare class GoogleCalendarGetEventQueryDto {
    calendarId: string;
}
export declare class GoogleCalendarDeleteEventDto {
    calendarId: string;
}
export {};
