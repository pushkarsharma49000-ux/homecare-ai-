import { supabase } from '@/lib/supabase/client';
import { DashboardKPIs } from '@/types';
import { formatDuration } from './adapters';

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  try {
    const [callsRes, requestsRes, escalationsRes, resolvedRes, durationRes] =
      await Promise.all([
        supabase.from('calls').select('*', { count: 'exact', head: true }),
        supabase.from('service_requests').select('*', { count: 'exact', head: true }),
        supabase
          .from('call_analysis')
          .select('*', { count: 'exact', head: true })
          .eq('human_escalation', true),
        supabase
          .from('call_analysis')
          .select('*', { count: 'exact', head: true })
          .eq('outcome', 'Resolved by AI'),
        supabase.from('calls').select('duration_seconds'),
      ]);

    const totalCalls = callsRes.count || 0;
    const serviceRequestsCount = requestsRes.count || 0;
    const humanEscalationsCount = escalationsRes.count || 0;
    const resolvedByAICount = resolvedRes.count || 0;

    let avgCallDurationSeconds = 0;
    if (durationRes.data && durationRes.data.length > 0) {
      const sum = durationRes.data.reduce(
        (acc: number, curr: { duration_seconds: number | null }) =>
          acc + (curr.duration_seconds || 0),
        0
      );
      avgCallDurationSeconds = Math.round(sum / durationRes.data.length);
    }

    const aiResolutionRate =
      totalCalls > 0 ? Math.round((resolvedByAICount / totalCalls) * 100) : 0;

    return {
      totalCalls,
      totalCallsSubtitle:
        totalCalls > 0 ? `${totalCalls} calls recorded in Supabase` : 'No inbound calls recorded yet',
      aiResolutionRate,
      aiResolutionRateSubtitle:
        totalCalls > 0
          ? `${resolvedByAICount} calls resolved autonomously`
          : 'Awaiting call telemetry',
      serviceRequestsCount,
      serviceRequestsSubtitle:
        serviceRequestsCount > 0
          ? `${serviceRequestsCount} active tickets in system`
          : 'No service requests created yet',
      humanEscalationsCount,
      humanEscalationsSubtitle:
        humanEscalationsCount > 0
          ? `${humanEscalationsCount} transfers flagged`
          : 'Zero human escalations',
      avgCallDuration: formatDuration(avgCallDurationSeconds),
      avgCallDurationSubtitle:
        totalCalls > 0 ? 'Average inbound call duration' : 'No duration data recorded',
    };
  } catch (err) {
    console.error('Unexpected error calculating dashboard KPIs:', err);
    return {
      totalCalls: 0,
      totalCallsSubtitle: 'Database connection offline',
      aiResolutionRate: 0,
      aiResolutionRateSubtitle: 'Unable to calculate',
      serviceRequestsCount: 0,
      serviceRequestsSubtitle: 'Unable to fetch requests',
      humanEscalationsCount: 0,
      humanEscalationsSubtitle: 'Unable to fetch escalations',
      avgCallDuration: '00:00',
      avgCallDurationSubtitle: 'Telemetry unavailable',
    };
  }
}
