import { supabase } from '@/lib/supabase/client';
import { Customer } from '@/types';
import { DbCustomer, DbAppliance, DbServiceRequest } from '@/types/supabase';
import { mapDbCustomerToCustomer, mapDbApplianceToAppliance } from './adapters';

export async function getCustomers(): Promise<Customer[]> {
  try {
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (custError) {
      console.error('Error fetching customers from Supabase:', custError.message);
      return [];
    }

    if (!customers || customers.length === 0) {
      return [];
    }

    // Fetch related appliances and open service requests for counts
    const customerIds = customers.map((c: DbCustomer) => c.id);

    const [appliancesRes, requestsRes] = await Promise.all([
      supabase.from('appliances').select('customer_id').in('customer_id', customerIds),
      supabase
        .from('service_requests')
        .select('customer_id, status')
        .in('customer_id', customerIds)
        .not('status', 'in', '("Resolved","Closed")'),
    ]);

    const applianceCounts: Record<string, number> = {};
    if (appliancesRes.data) {
      for (const a of appliancesRes.data) {
        applianceCounts[a.customer_id] = (applianceCounts[a.customer_id] || 0) + 1;
      }
    }

    const openReqCounts: Record<string, number> = {};
    if (requestsRes.data) {
      for (const r of requestsRes.data) {
        openReqCounts[r.customer_id] = (openReqCounts[r.customer_id] || 0) + 1;
      }
    }

    return customers.map((c: DbCustomer) =>
      mapDbCustomerToCustomer(c, applianceCounts[c.id] || 0, openReqCounts[c.id] || 0)
    );
  } catch (err) {
    console.error('Unexpected error in getCustomers:', err);
    return [];
  }
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching customer by id:', error.message);
      return null;
    }

    if (!customer) return null;

    // Fetch linked appliances
    const { data: dbAppliances } = await supabase
      .from('appliances')
      .select('*')
      .eq('customer_id', id);

    // Fetch open service requests count
    const { count: openRequestsCount } = await supabase
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id)
      .not('status', 'in', '("Resolved","Closed")');

    const mappedAppliances = (dbAppliances || []).map((a: DbAppliance) =>
      mapDbApplianceToAppliance(a, customer)
    );

    const mapped = mapDbCustomerToCustomer(
      customer,
      mappedAppliances.length,
      openRequestsCount || 0
    );

    mapped.appliances = mappedAppliances;
    return mapped;
  } catch (err) {
    console.error('Unexpected error in getCustomerById:', err);
    return null;
  }
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
