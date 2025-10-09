import { calendar_v3 } from 'googleapis';
import { GoogleOAuthService } from './google-oauth.service';
export declare class GoogleCalendarService {
    private readonly googleOAuthService;
    private readonly logger;
    constructor(googleOAuthService: GoogleOAuthService);
    private buildClient;
    listEvents(userId: string, params: calendar_v3.Params$Resource$Events$List): Promise<calendar_v3.Schema$Events>;
    getEvent(userId: string, params: calendar_v3.Params$Resource$Events$Get): Promise<calendar_v3.Schema$Event>;
    insertEvent(userId: string, params: calendar_v3.Params$Resource$Events$Insert): Promise<calendar_v3.Schema$Event>;
    patchEvent(userId: string, params: calendar_v3.Params$Resource$Events$Patch): Promise<calendar_v3.Schema$Event>;
    deleteEvent(userId: string, params: calendar_v3.Params$Resource$Events$Delete): Promise<void>;
}
