import { Call, CallIntent, CallSentiment, CallOutcome } from '@/types';
import { mockCalls } from '@/lib/mock-data/calls';

export async function getCalls(): Promise<Call[]> {
  // Phase 1: Return mock data. In Phase 2: Query Supabase `calls` table
  return mockCalls;
}

export async function getLiveCalls(): Promise<Call[]> {
  return mockCalls.filter((c) => c.isLive);
}

export async function getCallById(id: string): Promise<Call | null> {
  const call = mockCalls.find((c) => c.id === id);
  return call || null;
}

export async function getCallsByCustomerId(customerId: string): Promise<Call[]> {
  return mockCalls.filter((c) => c.customerId === customerId);
}

export interface CallFilters {
  search?: string;
  appliance?: string;
  intent?: CallIntent | 'All';
  sentiment?: CallSentiment | 'All';
  outcome?: CallOutcome | 'All';
  isLive?: boolean;
}

export async function filterCalls(filters: CallFilters): Promise<Call[]> {
  let results = [...mockCalls];

  if (filters.isLive !== undefined) {
    results = results.filter((c) => !!c.isLive === filters.isLive);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.customerPhone.toLowerCase().includes(q) ||
        c.issue.toLowerCase().includes(q)
    );
  }

  if (filters.appliance && filters.appliance !== 'All') {
    results = results.filter((c) => c.appliance === filters.appliance);
  }

  if (filters.intent && filters.intent !== 'All') {
    results = results.filter((c) => c.intent === filters.intent);
  }

  if (filters.sentiment && filters.sentiment !== 'All') {
    results = results.filter((c) => c.sentiment === filters.sentiment);
  }

  if (filters.outcome && filters.outcome !== 'All') {
    results = results.filter((c) => c.outcome === filters.outcome);
  }

  return results;
}
