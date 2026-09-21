import React from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  CheckCircle2,
  Wrench,
  AlertCircle,
  Clock,
  Radio,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  RequestStatusBadge,
  PriorityBadge,
  AIStateBadge,
} from '@/components/ui/StatusBadge';
import { getLiveCalls } from '@/lib/services/calls';
import { getServiceRequests } from '@/lib/services/service-requests';
import { getDashboardKPIs } from '@/lib/services/dashboard';
import { mockTopProblems, mockAIQualityMetrics } from '@/lib/mock-data/analytics';

export default async function DashboardPage() {
  const [kpiData, liveCalls, allServiceRequests] = await Promise.all([
    getDashboardKPIs(),
    getLiveCalls(),
    getServiceRequests(),
  ]);

  const serviceRequests = allServiceRequests.slice(0, 5);

  const kpis = [
    {
      title: 'Total Sessions',
      value: kpiData.totalCalls.toString(),
      subtitle: kpiData.totalCallsSubtitle,
      icon: PhoneCall,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: kpiData.totalCalls > 0 ? `${kpiData.totalCalls} in database` : 'No data yet',
    },
    {
      title: 'AI Resolution Rate',
      value: `${kpiData.aiResolutionRate}%`,
      subtitle: kpiData.aiResolutionRateSubtitle,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      change: kpiData.totalCalls > 0 ? 'Autonomous resolutions' : 'Awaiting sessions',
    },
    {
      title: 'Service Requests',
      value: kpiData.serviceRequestsCount.toString(),
      subtitle: kpiData.serviceRequestsSubtitle,
      icon: Wrench,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      change: kpiData.serviceRequestsCount > 0 ? `${kpiData.serviceRequestsCount} total tickets` : 'No tickets',
    },
    {
      title: 'Human Escalations',
      value: kpiData.humanEscalationsCount.toString(),
      subtitle: kpiData.humanEscalationsSubtitle,
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      change: kpiData.humanEscalationsCount > 0 ? 'Supervisor intervention' : 'Zero escalations',
    },
    {
      title: 'Average Call Duration',
      value: kpiData.avgCallDuration,
      subtitle: kpiData.avgCallDurationSubtitle,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      change: 'Calculated from sessions',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Good evening</h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening across customer support today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-subtle">
            <span className="text-xs text-slate-500 block">Current Operations</span>
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Inbound Lines Optimal
            </span>
          </div>
          <Link href="/live-calls">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Monitor ({liveCalls.length})</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards (Section 7) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title} className="hover:border-slate-300 transition-shadow">
              <div className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500 truncate">{kpi.title}</span>
                  <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {kpi.value}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{kpi.subtitle}</p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-medium text-slate-600">{kpi.change}</span>
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Live Support Sessions Snapshot (Section 8) */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <CardTitle>Active Support Sessions</CardTitle>
              <p className="text-xs text-slate-500">
                Customer conversations currently being processed by the AI Support Agent
              </p>
            </div>
          </div>
          <Link href="/live-calls">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>View All ({liveCalls.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Appliance</th>
                <th className="px-5 py-3">Issue</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">AI Status</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {liveCalls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Radio className="w-6 h-6 text-slate-300" />
                      <p className="font-medium text-slate-600">No active AI sessions in progress</p>
                      <p className="text-xs text-slate-400">Active browser support sessions will appear here in real time.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                liveCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{call.customerName}</div>
                      <div className="text-[11px] text-slate-500">{call.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {call.appliance}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-800">{call.issue}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{call.duration}</td>
                    <td className="px-5 py-3.5">
                      <AIStateBadge state={call.aiState} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={call.priority} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/live-calls/${call.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-blue-600 hover:text-blue-700">
                          <span>Monitor</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Service Requests (Section 9) */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Recent Service Requests</CardTitle>
              <p className="text-xs text-slate-500">
                Action items created automatically by AI agent requiring technician dispatch
              </p>
            </div>
          </div>
          <Link href="/service-requests">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>View All ({allServiceRequests.length})</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Request ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Appliance & Issue</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {serviceRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench className="w-6 h-6 text-slate-300" />
                      <p className="font-medium text-slate-600">No service requests recorded</p>
                      <p className="text-xs text-slate-400">Tickets generated from customer support sessions will be listed here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                serviceRequests.map((sr) => (
                  <tr key={sr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">
                      {sr.id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{sr.customerName}</div>
                      <div className="text-[11px] text-slate-500">{sr.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{sr.appliance}</div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate">{sr.issue}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RequestStatusBadge status={sr.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={sr.priority} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/service-requests/${sr.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-slate-600 hover:text-slate-900">
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Grid: Problem Distribution & AI Performance (Section 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Appliance Problems */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <CardTitle>Top Appliance Failure Patterns</CardTitle>
            </div>
            <Badge variant="secondary" className="text-[10px] font-semibold">Real-Time Telemetry</Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            {mockTopProblems.map((prob) => (
              <div key={prob.issue} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{prob.issue} ({prob.appliance})</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{prob.count} calls</span>
                    <span className="text-[11px] text-slate-400">({prob.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${prob.percentage * 3.2}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Performance Scorecard */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <CardTitle>AI Voice Quality & Confidence</CardTitle>
            </div>
            <Badge variant="success" className="text-[10px]">Model v2.4 Active</Badge>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">Intent Recognition</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
                {mockAIQualityMetrics.intentAccuracy}%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">99.1% target reached</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">Action Execution</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
                {mockAIQualityMetrics.actionAccuracy}%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Zero dispatch errors</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">Avg AI Confidence</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
                {mockAIQualityMetrics.averageAIConfidence}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Across all intents</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block">Speech-to-Intent Latency</span>
              <span className="text-2xl font-bold text-slate-900 font-mono mt-1 block">
                420ms
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Ultra low latency</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
