import { Notification } from '@/types/ai-support';

export interface NotificationService {
  send(notification: Notification): Promise<Notification>;
  queueEmailConfirmation(input: { recipient: string; customerName: string; appliance: string; issue: string; serviceRequestId: string; appointmentId: string; start: string; status: string; timezone: string; calendarSynced: boolean }): Promise<Notification>;
}

export class ResendNotificationProvider implements NotificationService {
  private readonly apiKey = process.env.EMAIL_API_KEY;
  private readonly from = process.env.EMAIL_FROM;
  get configured() { return process.env.EMAIL_PROVIDER === 'resend' && Boolean(this.apiKey && this.from); }
  async send(notification: Notification): Promise<Notification> { return notification; }
  async queueEmailConfirmation(input: Parameters<NotificationService['queueEmailConfirmation']>[0]): Promise<Notification> {
    if (!this.configured) throw new Error('Email provider is not configured.');
    const when = new Date(input.start).toLocaleString('en-IN', { timeZone: input.timezone, dateStyle: 'medium', timeStyle: 'short' });
    const text = `Hello ${input.customerName}, your HomeCare AI service appointment is confirmed for ${when} (${input.timezone}). Appliance: ${input.appliance}. Issue: ${input.issue}. Service request: ${input.serviceRequestId}. Appointment: ${input.appointmentId}.${input.calendarSynced ? ' A Google Calendar event was created.' : ''}`;
    const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: this.from, to: [input.recipient], subject: 'HomeCare AI – Service Appointment Confirmed', text, html: `<p>Hello ${input.customerName},</p><p><strong>Your HomeCare AI service appointment is confirmed.</strong></p><p>${text}</p>` }) });
    const body = await response.json() as { id?: string; message?: string }; if (!response.ok || !body.id) throw new Error(body.message || 'Email delivery failed.');
    return { id: body.id, recipient: input.recipient, channel: 'email', subject: 'HomeCare AI – Service Appointment Confirmed', body: text, status: 'sent', createdAt: new Date().toISOString() };
  }
}

/** Truthful fallback: appointments remain valid, but no delivery is claimed without a configured provider. */
export class UnconfiguredNotificationProvider implements NotificationService {
  async send(notification: Notification): Promise<Notification> {
    return {
      ...notification,
      status: 'failed',
    };
  }

  async queueEmailConfirmation(input: Parameters<NotificationService['queueEmailConfirmation']>[0]): Promise<Notification> {
    return {
      id: `notification-${Date.now()}`,
      recipient: input.recipient,
      channel: 'email',
      subject: 'HomeCare service confirmation',
      body: 'Email provider is not configured.',
      status: 'failed',
      createdAt: new Date().toISOString(),
    };
  }
}

const resendProvider = new ResendNotificationProvider();
export const notificationService: NotificationService = resendProvider.configured ? resendProvider : new UnconfiguredNotificationProvider();
