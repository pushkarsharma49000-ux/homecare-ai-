import { Appointment, AppointmentSlot } from '@/types/ai-support';

export interface AppointmentService {
  getAvailableSlots(customerId?: string, applianceId?: string): Promise<AppointmentSlot[]>;
  bookAppointment(slotId: string, customerId?: string, serviceRequestId?: string): Promise<Appointment>;
}

export class PlaceholderAppointmentService implements AppointmentService {
  async getAvailableSlots(_customerId?: string, _applianceId?: string): Promise<AppointmentSlot[]> {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    return [
      {
        id: 'slot-1',
        technicianId: 'tech-1',
        technicianName: 'Amit Verma',
        start: start.toISOString(),
        end: end.toISOString(),
        timezone: 'Asia/Kolkata',
        status: 'available',
      },
    ];
  }

  async bookAppointment(
    slotId: string,
    customerId?: string,
    serviceRequestId?: string
  ): Promise<Appointment> {
    const slot: AppointmentSlot = {
      id: slotId,
      technicianId: 'tech-1',
      technicianName: 'Amit Verma',
      start: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      timezone: 'Asia/Kolkata',
      status: 'booked',
    };

    return {
      id: `appointment-${Date.now()}`,
      customerId,
      serviceRequestId,
      applianceId: undefined,
      slot,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const appointmentService = new PlaceholderAppointmentService();
