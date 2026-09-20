import { supabase } from '@/lib/supabase/client';
import { Call, CallIntent, CallSentiment, CallOutcome, TranscriptMessage, CallAnalysis, ActionItem } from '@/types';
import { DbCall, DbCustomer, DbCallAnalysis, DbTranscript, DbAction } from '@/types/supabase';
import { mapDbCallToCall, mapDbTranscriptToMessage, mapDbCallAnalysisToAnalysis, mapDbActionToActionItem } from './adapters';

export interface CallFilters {
  search?: string;
  appliance?: string;
  intent?: CallIntent | 'All';
  sentiment?: CallSentiment | 'All';
  outcome?: CallOutcome | 'All';
  isLive?: boolean;
}

export async function getCalls(): Promise<Call[]> {
  try {
    const { data: dbCalls, error } = await supabase
      .from('calls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching calls from Supabase:', error.message);
      return [];
    }

    if (!dbCalls || dbCalls.length === 0) {
      return [];
    }

    const callIds = dbCalls.map((c: DbCall) => c.id);
    const customerIds = Array.from(new Set(dbCalls.map((c: DbCall) => c.customer_id)));

    const [custRes, analysisRes] = await Promise.all([
      supabase.from('customers').select('*').in('id', customerIds),
      supabase.from('call_analysis').select('*').in('call_id', callIds),
    ]);

    const customerMap: Record<string, DbCustomer> = {};
    if (custRes.data) {
      for (const c of custRes.data) customerMap[c.id] = c;
    }

    const analysisMap: Record<string, DbCallAnalysis> = {};
    if (analysisRes.data) {
      for (const a of analysisRes.data) analysisMap[a.call_id] = a;
    }

    return dbCalls.map((call: DbCall) =>
      mapDbCallToCall(call, customerMap[call.customer_id], analysisMap[call.id])
    );
  } catch (err) {
    console.error('Unexpected error in getCalls:', err);
    return [];
  }
}

export async function getLiveCalls(): Promise<Call[]> {
  try {
    const { data: dbCalls, error } = await supabase
      .from('calls')
      .select('*')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching live calls from Supabase:', error.message);
      return [];
    }

    if (!dbCalls || dbCalls.length === 0) {
      return [];
    }

    const callIds = dbCalls.map((c: DbCall) => c.id);
    const customerIds = Array.from(new Set(dbCalls.map((c: DbCall) => c.customer_id)));

    const [custRes, analysisRes] = await Promise.all([
      supabase.from('customers').select('*').in('id', customerIds),
      supabase.from('call_analysis').select('*').in('call_id', callIds),
    ]);

    const customerMap: Record<string, DbCustomer> = {};
    if (custRes.data) {
      for (const c of custRes.data) customerMap[c.id] = c;
    }

    const analysisMap: Record<string, DbCallAnalysis> = {};
    if (analysisRes.data) {
      for (const a of analysisRes.data) analysisMap[a.call_id] = a;
    }

    return dbCalls.map((call: DbCall) =>
      mapDbCallToCall(call, customerMap[call.customer_id], analysisMap[call.id])
    );
  } catch (err) {
    console.error('Unexpected error in getLiveCalls:', err);
    return [];
  }
}

export async function getCallById(id: string): Promise<Call | null> {
  try {
    const { data: call, error } = await supabase
      .from('calls')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching call by id:', error.message);
      return null;
    }

    if (!call) return null;

    const [customerRes, analysisRes, transcriptsRes, actionsRes] = await Promise.all([
      call.customer_id
        ? supabase.from('customers').select('*').eq('id', call.customer_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('call_analysis').select('*').eq('call_id', id).maybeSingle(),
      supabase
        .from('transcripts')
        .select('*')
        .eq('call_id', id)
        .order('timestamp_seconds', { ascending: true }),
      supabase
        .from('actions')
        .select('*')
        .eq('call_id', id)
        .order('created_at', { ascending: true }),
    ]);

    const customer = customerRes.data || null;
    const analysis = analysisRes.data || null;
    const transcripts = (transcriptsRes.data || []) as DbTranscript[];
    const actions = (actionsRes.data || []) as DbAction[];

    return mapDbCallToCall(call, customer, analysis, transcripts, actions);
  } catch (err) {
    console.error('Unexpected error in getCallById:', err);
    return null;
  }
}

export async function getCallsByCustomerId(customerId: string): Promise<Call[]> {
  try {
    const { data: calls, error } = await supabase
      .from('calls')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching calls by customer id:', error.message);
      return [];
    }

    if (!calls || calls.length === 0) return [];

    const callIds = calls.map((c: DbCall) => c.id);
    const [custRes, analysisRes] = await Promise.all([
      supabase.from('customers').select('*').eq('id', customerId).maybeSingle(),
      supabase.from('call_analysis').select('*').in('call_id', callIds),
    ]);

    const customer = custRes.data || null;
    const analysisMap: Record<string, DbCallAnalysis> = {};
    if (analysisRes.data) {
      for (const a of analysisRes.data) analysisMap[a.call_id] = a;
    }

    return calls.map((call: DbCall) =>
      mapDbCallToCall(call, customer, analysisMap[call.id])
    );
  } catch (err) {
    console.error('Unexpected error in getCallsByCustomerId:', err);
    return [];
  }
}

export async function getCallTranscripts(callId: string): Promise<TranscriptMessage[]> {
  try {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('call_id', callId)
      .order('timestamp_seconds', { ascending: true });

    if (error) {
      console.error('Error fetching call transcripts:', error.message);
      return [];
    }

    return (data || []).map((t: DbTranscript) => mapDbTranscriptToMessage(t));
  } catch (err) {
    console.error('Unexpected error in getCallTranscripts:', err);
    return [];
  }
}

export async function getCallAnalysis(callId: string): Promise<CallAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('call_analysis')
      .select('*')
      .eq('call_id', callId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching call analysis:', error.message);
      return null;
    }

    return data ? mapDbCallAnalysisToAnalysis(data) : null;
  } catch (err) {
    console.error('Unexpected error in getCallAnalysis:', err);
    return null;
  }
}

export async function getCallActions(callId: string): Promise<ActionItem[]> {
  try {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('call_id', callId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching call actions:', error.message);
      return [];
    }

    return (data || []).map((a: DbAction) => mapDbActionToActionItem(a));
  } catch (err) {
    console.error('Unexpected error in getCallActions:', err);
    return [];
  }
}

export async function filterCalls(filters: CallFilters): Promise<Call[]> {
  const allCalls = await getCalls();
  let results = [...allCalls];

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
