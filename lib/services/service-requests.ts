import { ServiceRequest, ServiceRequestStatus, CallPriority } from '@/types';
import { mockServiceRequests } from '@/lib/mock-data/service-requests';

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  // Phase 1: Return mock data. In Phase 2: Query Supabase `service_requests` table
  return mockServiceRequests;
}

export async function getServiceRequestById(id: string): Promise<ServiceRequest | null> {
  const sr = mockServiceRequests.find((r) => r.id === id);
  return sr || null;
}

export async function getServiceRequestsByCustomerId(customerId: string): Promise<ServiceRequest[]> {
  return mockServiceRequests.filter((r) => r.customerId === customerId);
}

export async function getServiceRequestsByApplianceId(applianceId: string): Promise<ServiceRequest[]> {
  return mockServiceRequests.filter((r) => r.applianceId === applianceId);
}

export interface ServiceRequestFilters {
  search?: string;
  status?: ServiceRequestStatus | 'All';
  priority?: CallPriority | 'All';
  appliance?: string;
}

export async function filterServiceRequests(filters: ServiceRequestFilters): Promise<ServiceRequest[]> {
  let results = [...mockServiceRequests];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.issue.toLowerCase().includes(q) ||
        (r.assignedTechnician && r.assignedTechnician.toLowerCase().includes(q))
    );
  }

  if (filters.status && filters.status !== 'All') {
    results = results.filter((r) => r.status === filters.status);
  }

  if (filters.priority && filters.priority !== 'All') {
    results = results.filter((r) => r.priority === filters.priority);
  }

  if (filters.appliance && filters.appliance !== 'All') {
    results = results.filter((r) => r.appliance === filters.appliance);
  }

  return results;
}
