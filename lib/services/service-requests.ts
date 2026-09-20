import { supabase } from '@/lib/supabase/client';
import { ServiceRequest, ServiceRequestStatus, CallPriority } from '@/types';
import { DbServiceRequest, DbCustomer, DbAppliance, DbAction } from '@/types/supabase';
import { mapDbServiceRequestToServiceRequest } from './adapters';

export interface ServiceRequestFilters {
  search?: string;
  status?: ServiceRequestStatus | 'All';
  priority?: CallPriority | 'All';
  appliance?: string;
}

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  try {
    const { data: dbRequests, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching service requests from Supabase:', error.message);
      return [];
    }

    if (!dbRequests || dbRequests.length === 0) {
      return [];
    }

    const customerIds = Array.from(new Set(dbRequests.map((r: DbServiceRequest) => r.customer_id)));
    const applianceIds = Array.from(new Set(dbRequests.map((r: DbServiceRequest) => r.appliance_id)));

    const [custRes, appRes] = await Promise.all([
      supabase.from('customers').select('*').in('id', customerIds),
      supabase.from('appliances').select('*').in('id', applianceIds),
    ]);

    const customerMap: Record<string, DbCustomer> = {};
    if (custRes.data) {
      for (const c of custRes.data) customerMap[c.id] = c;
    }

    const applianceMap: Record<string, DbAppliance> = {};
    if (appRes.data) {
      for (const a of appRes.data) applianceMap[a.id] = a;
    }

    return dbRequests.map((r: DbServiceRequest) =>
      mapDbServiceRequestToServiceRequest(
        r,
        customerMap[r.customer_id] || null,
        applianceMap[r.appliance_id] || null
      )
    );
  } catch (err) {
    console.error('Unexpected error in getServiceRequests:', err);
    return [];
  }
}

export async function getServiceRequestById(id: string): Promise<ServiceRequest | null> {
  try {
    // Look up by request_number or id
    let req: DbServiceRequest | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) req = data;
    }

    if (!req) {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('request_number', id)
        .maybeSingle();
      if (!error && data) req = data;
    }

    if (!req) return null;

    const [customerRes, applianceRes, actionsRes] = await Promise.all([
      req.customer_id
        ? supabase.from('customers').select('*').eq('id', req.customer_id).maybeSingle()
        : Promise.resolve({ data: null }),
      req.appliance_id
        ? supabase.from('appliances').select('*').eq('id', req.appliance_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from('actions')
        .select('*')
        .eq('service_request_id', req.id)
        .order('created_at', { ascending: true }),
    ]);

    const customer = customerRes.data || null;
    const appliance = applianceRes.data || null;
    const actions = (actionsRes.data || []) as DbAction[];

    return mapDbServiceRequestToServiceRequest(req, customer, appliance, actions);
  } catch (err) {
    console.error('Unexpected error in getServiceRequestById:', err);
    return null;
  }
}

export async function getServiceRequestsByCustomerId(customerId: string): Promise<ServiceRequest[]> {
  try {
    const { data: requests, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching service requests by customer:', error.message);
      return [];
    }

    if (!requests || requests.length === 0) return [];

    const applianceIds = Array.from(new Set(requests.map((r: DbServiceRequest) => r.appliance_id)));
    const [custRes, appRes] = await Promise.all([
      supabase.from('customers').select('*').eq('id', customerId).maybeSingle(),
      supabase.from('appliances').select('*').in('id', applianceIds),
    ]);

    const customer = custRes.data || null;
    const applianceMap: Record<string, DbAppliance> = {};
    if (appRes.data) {
      for (const a of appRes.data) applianceMap[a.id] = a;
    }

    return requests.map((r: DbServiceRequest) =>
      mapDbServiceRequestToServiceRequest(r, customer, applianceMap[r.appliance_id])
    );
  } catch (err) {
    console.error('Unexpected error in getServiceRequestsByCustomerId:', err);
    return [];
  }
}

export async function getServiceRequestsByApplianceId(applianceId: string): Promise<ServiceRequest[]> {
  try {
    const { data: requests, error } = await supabase
      .from('service_requests')
      .select('*')
      .eq('appliance_id', applianceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching service requests by appliance:', error.message);
      return [];
    }

    if (!requests || requests.length === 0) return [];

    const customerIds = Array.from(new Set(requests.map((r: DbServiceRequest) => r.customer_id)));
    const [custRes, appRes] = await Promise.all([
      supabase.from('customers').select('*').in('id', customerIds),
      supabase.from('appliances').select('*').eq('id', applianceId).maybeSingle(),
    ]);

    const customerMap: Record<string, DbCustomer> = {};
    if (custRes.data) {
      for (const c of custRes.data) customerMap[c.id] = c;
    }
    const appliance = appRes.data || null;

    return requests.map((r: DbServiceRequest) =>
      mapDbServiceRequestToServiceRequest(r, customerMap[r.customer_id], appliance)
    );
  } catch (err) {
    console.error('Unexpected error in getServiceRequestsByApplianceId:', err);
    return [];
  }
}

export async function filterServiceRequests(filters: ServiceRequestFilters): Promise<ServiceRequest[]> {
  const all = await getServiceRequests();
  let results = [...all];

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
