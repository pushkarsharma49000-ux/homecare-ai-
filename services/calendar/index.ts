import { createSign } from 'crypto';

export interface CalendarEventInput { title: string; description: string; start: string; end: string; timezone: string; }

export interface CalendarProvider {
  createEvent(input: CalendarEventInput): Promise<{ id: string; provider: 'google' }>;
  updateEvent(id: string, input: CalendarEventInput): Promise<void>;
  cancelEvent(id: string): Promise<void>;
}

export class GoogleCalendarProvider implements CalendarProvider {
  private readonly calendarId = process.env.GOOGLE_CALENDAR_ID;
  private readonly email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  private readonly privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  get configured() { return Boolean(this.calendarId && this.email && this.privateKey); }
  private async token() {
    if (!this.configured) throw new Error('Google Calendar is not configured.');
    const encode = (value: string) => Buffer.from(value).toString('base64url'); const now = Math.floor(Date.now() / 1000);
    const header = encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claims = encode(JSON.stringify({ iss: this.email, scope: 'https://www.googleapis.com/auth/calendar.events', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 }));
    const signer = createSign('RSA-SHA256'); signer.update(`${header}.${claims}`); signer.end();
    const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claims}.${signer.sign(this.privateKey!, 'base64url')}` }) });
    const body = await response.json() as { access_token?: string }; if (!response.ok || !body.access_token) throw new Error('Google authentication failed.'); return body.access_token;
  }
  async createEvent(input: CalendarEventInput) {
    const token = await this.token(); const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.calendarId!)}/events`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ summary: input.title, description: input.description, start: { dateTime: input.start, timeZone: input.timezone }, end: { dateTime: input.end, timeZone: input.timezone } }) });
    const body = await response.json().catch(() => ({})) as { id?: string; error?: { code?: unknown; message?: unknown; errors?: Array<{ reason?: unknown }> } };
    if (!response.ok || !body.id) {
      const error = body.error;
      console.error('[calendar] Google API error', {
        status: response.status,
        statusText: response.statusText,
        googleErrorCode: typeof error?.code === 'number' ? error.code : undefined,
        googleErrorMessage: typeof error?.message === 'string' ? error.message : undefined,
        googleErrorReason: typeof error?.errors?.[0]?.reason === 'string' ? error.errors[0].reason : undefined,
      });
      throw new Error('Google Calendar event creation failed.');
    }
    return { id: body.id, provider: 'google' as const };
  }
  async updateEvent(_id: string, _input: CalendarEventInput) { throw new Error('Google Calendar update is not implemented.'); }
  async cancelEvent(_id: string) { throw new Error('Google Calendar cancellation is not implemented.'); }
}

export class UnconfiguredCalendarProvider implements CalendarProvider {
  async createEvent(_input: CalendarEventInput): Promise<{ id: string; provider: 'google' }> { throw new Error('Google Calendar is not configured.'); }
  async updateEvent(_id: string, _input: CalendarEventInput) {}
  async cancelEvent(_id: string) {}
}

const googleCalendarProvider = new GoogleCalendarProvider();
export const calendarProvider: CalendarProvider = googleCalendarProvider.configured ? googleCalendarProvider : new UnconfiguredCalendarProvider();
