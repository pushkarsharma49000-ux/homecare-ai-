import { Appliance, ApplianceType } from '@/types';
import { mockAppliances } from '@/lib/mock-data/appliances';

export async function getAppliances(filterType?: ApplianceType): Promise<Appliance[]> {
  // Phase 1: Return mock data. In Phase 2: Query Supabase `appliances` table
  if (filterType) {
    return mockAppliances.filter((a) => a.type === filterType);
  }
  return mockAppliances;
}

export async function getApplianceById(id: string): Promise<Appliance | null> {
  const appliance = mockAppliances.find((a) => a.id === id);
  return appliance || null;
}

export async function getAppliancesByCustomerId(customerId: string): Promise<Appliance[]> {
  return mockAppliances.filter((a) => a.customerId === customerId);
}
