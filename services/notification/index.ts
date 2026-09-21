import { Notification } from '@/types/ai-support';

export interface NotificationService {
  send(notification: Notification): Promise<Notification>;
  queueEmailConfirmation(recipient: string, serviceRequestId?: string): Promise<Notification>;
}

export class PlaceholderNotificationService implements NotificationService {
  async send(notification: Notification): Promise<Notification> {
    return {
      ...notification,
      status: 'not_implemented',
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
      status: 'not_implemented',
      createdAt: new Date().toISOString(),
    };
  }
}

export const notificationService = new PlaceholderNotificationService();
