import { Notification } from '@/types/ai-support';

export interface NotificationService {
  send(notification: Notification): Promise<Notification>;
  queueEmailConfirmation(recipient: string, serviceRequestId?: string): Promise<Notification>;
}

/** Truthful fallback: appointments remain valid, but no delivery is claimed without a configured provider. */
export class UnconfiguredNotificationProvider implements NotificationService {
  async send(notification: Notification): Promise<Notification> {
    return {
      ...notification,
      status: 'failed',
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
      status: 'failed',
      createdAt: new Date().toISOString(),
    };
  }
}

export const notificationService = new UnconfiguredNotificationProvider();
