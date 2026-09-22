export interface CalendarEventInput {
  title: string;
  description: string;
  start: string;
  end: string;
}

export interface CalendarProvider {
  createEvent(input: CalendarEventInput): Promise<{ id: string; provider: 'mock' | 'google' }>;
  updateEvent(id: string, input: CalendarEventInput): Promise<void>;
  cancelEvent(id: string): Promise<void>;
}

export class MockCalendarProvider implements CalendarProvider {
  async createEvent(_input: CalendarEventInput) { return { id: `mock-calendar-${crypto.randomUUID()}`, provider: 'mock' as const }; }
  async updateEvent(_id: string, _input: CalendarEventInput) {}
  async cancelEvent(_id: string) {}
}

// Google Calendar is intentionally not selected until OAuth/service-account credentials are configured.
export const calendarProvider: CalendarProvider = new MockCalendarProvider();
