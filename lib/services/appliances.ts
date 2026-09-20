import { supabase } from '@/lib/supabase/client';
import { Appliance, ApplianceType } from '@/types';
import { DbAppliance, DbCustomer } from '@/types/supabase';
import { mapDbApplianceToAppliance, normalizeApplianceType } from './adapters';

export async function getAppliances(filterType?: ApplianceType): Promise<Appliance[]> {
  try {
    const { data: dbAppliances, error } = await supabase
      .from('appliances')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching appliances from Supabase:', error.message);
      return [];
    }

    if (!dbAppliances || dbAppliances.length === 0) {
      return [];
    }

    // Fetch related customers for names and phone numbers
    const customerIds = Array.from(new Set(dbAppliances.map((a: DbAppliance) => a.customer_id)));
    let customerMap: Record<string, DbCustomer> = {};

    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds);

      if (customers) {
        for (const c of customers) {
          customerMap[c.id] = c;
        }
      }
    }

    let mapped = dbAppliances.map((a: DbAppliance) =>
      mapDbApplianceToAppliance(a, customerMap[a.customer_id] || null)
    );

    if (filterType && filterType !== ('All' as unknown as ApplianceType)) {
      mapped = mapped.filter((a) => a.type === filterType);
    }

    return mapped;
  } catch (err) {
    console.error('Unexpected error in getAppliances:', err);
    return [];
  }
}

export async function getApplianceById(id: string): Promise<Appliance | null> {
  try {
    const { data: dbAppliance, error } = await supabase
      .from('appliances')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching appliance by id:', error.message);
      return null;
    }

    if (!dbAppliance) return null;

    let customer: DbCustomer | null = null;
    if (dbAppliance.customer_id) {
      const { data: c } = await supabase
        .from('customers')
        .select('*')
        .eq('id', dbAppliance.customer_id)
        .maybeSingle();
      customer = c;
    }

    return mapDbApplianceToAppliance(dbAppliance, customer);
  } catch (err) {
    console.error('Unexpected error in getApplianceById:', err);
    return null;
  }
}

export async function getAppliancesByCustomerId(customerId: string): Promise<Appliance[]> {
  try {
    const [appliancesRes, customerRes] = await Promise.all([
      supabase.from('appliances').select('*').eq('customer_id', customerId),
      supabase.from('customers').select('*').eq('id', customerId).maybeSingle(),
    ]);

    if (appliancesRes.error) {
      console.error('Error fetching customer appliances:', appliancesRes.error.message);
      return [];
    }

    const customer = customerRes.data || null;
    return (appliancesRes.data || []).map((a: DbAppliance) =>
      mapDbApplianceToAppliance(a, customer)
    );
  } catch (err) {
    console.error('Unexpected error in getAppliancesByCustomerId:', err);
    return [];
  }
}
