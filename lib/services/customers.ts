import { Customer } from '@/types';
import { mockCustomers } from '@/lib/mock-data/customers';
import { mockAppliances } from '@/lib/mock-data/appliances';

export async function getCustomers(): Promise<Customer[]> {
  // Phase 1: Return mock data. In Phase 2: Query Supabase `customers` table
  return mockCustomers.map((cust) => ({
    ...cust,
    appliances: mockAppliances.filter((a) => a.customerId === cust.id),
  }));
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const customer = mockCustomers.find((c) => c.id === id);
  if (!customer) return null;

  return {
    ...customer,
    appliances: mockAppliances.filter((a) => a.customerId === customer.id),
  };
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const all = await getCustomers();
  if (!query.trim()) return all;
  const q = query.toLowerCase();
  return all.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
  );
}
