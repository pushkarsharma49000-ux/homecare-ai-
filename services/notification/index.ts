import { Notification } from '@/types/ai-support';

export interface NotificationService {
  send(notification: Notification): Promise<Notification>;
  queueEmailConfirmation(recipient: string, serviceRequestId?: string): Promise<Notification>;
}

/** Development-safe provider. Swap this behind the same interface when an email provider is configured. */
export class MockNotificationProvider implements NotificationService {
  async send(notification: Notification): Promise<Notification> {
    return {
      ...notification,
      status: 'sent',
    };
  }

  async queueEmailConfirmation(recipient: string, serviceRequestId?: string): Promise<Notification> {
    return {
      id: `notification-${Date.now()}`,
      recipient,
      channel: 'email',
      subject: 'HomeCare service confirmation',
      body: serviceRequestId
        ? `Your service appointment has been scheduled for request ${serviceRequestId}.`
        : 'Your HomeCare service request has been received.',
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
  }
}

export const notificationService = new MockNotificationProvider();
