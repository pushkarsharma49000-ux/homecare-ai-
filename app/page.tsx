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
import { mockTopProblems, mockAIQualityMetrics } from '@/lib/mock-data/analytics';

export default async function DashboardPage() {
  const liveCalls = await getLiveCalls();
  const serviceRequests = (await getServiceRequests()).slice(0, 5);

  const kpis = [
    {
      title: 'Total Calls',
      value: '147',
      subtitle: "Today's inbound calls",
      icon: PhoneCall,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+14% vs yesterday',
    },
    {
      title: 'AI Resolution Rate',
      value: '82%',
      subtitle: 'Resolved without human escalation',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      change: '+3.2% this week',
    },
    {
      title: 'Service Requests',
      value: '34',
      subtitle: 'Created today',
      icon: Wrench,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      change: '23.1% conversion',
    },
    {
      title: 'Human Escalations',
      value: '18',
      subtitle: 'Requires support-team intervention',
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      change: '12.2% escalation rate',
    },
    {
      title: 'Average Call Duration',
      value: '02:41',
      subtitle: 'Average inbound call duration',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      change: '-18s vs benchmark',
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

      {/* Live Calls Snapshot (Section 8) */}
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <CardTitle>Active Live Calls</CardTitle>
              <p className="text-xs text-slate-500">
                Inbound customer calls currently being processed by AI Voice Agent
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
              {liveCalls.map((call) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grid: Top Customer Issues & AI Performance (Sections 9 & 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Customer Issues (Section 9) */}
        <Card className="lg:col-span-7">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Top Customer Issues</CardTitle>
              <p className="text-xs text-slate-500">Most frequent inbound customer support inquiries today</p>
            </div>
            <Badge variant="secondary" className="text-[11px]">117 Inquiries Analyzed</Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {mockTopProblems.map((item) => {
              const maxVal = 32;
              const percentageOfMax = Math.round((item.count / maxVal) * 100);
              return (
                <div key={item.issue} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.issue}</span>
                    <span className="font-bold text-slate-900">
                      {item.count} <span className="text-slate-400 font-normal">calls</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentageOfMax}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Category: {item.appliance}</span>
                    <span>{item.percentage}% of call volume</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* AI Performance Metrics (Section 10) */}
        <Card className="lg:col-span-5">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Performance</span>
              </CardTitle>
              <p className="text-xs text-slate-500">Autonomous voice agent operational quality</p>
            </div>
            <Badge variant="success">Healthy</Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Intent Accuracy</span>
                <span className="text-[11px] text-slate-500">Correct symptom classification</span>
              </div>
              <span className="text-lg font-bold text-blue-700">94%</span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Action Success Rate</span>
                <span className="text-[11px] text-slate-500">Automated service actions completed</span>
              </div>
              <span className="text-lg font-bold text-emerald-700">91%</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Average AI Confidence</span>
                <span className="text-[11px] text-slate-500">Weighted decision certainty score</span>
              </div>
              <span className="text-lg font-bold text-slate-800">92%</span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Human Escalation Rate</span>
                <span className="text-[11px] text-slate-500">Below threshold or requested transfer</span>
              </div>
              <span className="text-lg font-bold text-amber-700">12%</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Average Resolution Time</span>
                <span className="text-[11px] text-slate-500">Inbound greeting to action completion</span>
              </div>
              <span className="text-lg font-bold text-slate-800 font-mono">03:12</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Service Requests (Section 11) */}
      <Card>
        <CardHeader className="border-b border-slate-100">
          <div>
            <CardTitle>Recent Service Requests</CardTitle>
            <p className="text-xs text-slate-500">Automated and assigned tickets from inbound voice interactions</p>
          </div>
          <Link href="/service-requests">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>View All Service Requests</span>
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
                <th className="px-5 py-3">Appliance</th>
                <th className="px-5 py-3">Issue</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {serviceRequests.map((sr) => (
                <tr key={sr.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-blue-600 font-mono">
                    <Link href={`/service-requests/${sr.id}`} className="hover:underline">
                      {sr.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900">{sr.customerName}</div>
                    <div className="text-[11px] text-slate-400">{sr.customerPhone}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-800">{sr.appliance}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{sr.brand}</div>
                  </td>
                  <td className="px-5 py-3.5 max-w-xs truncate text-slate-800">{sr.issue}</td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={sr.priority} />
                  </td>
                  <td className="px-5 py-3.5">
                    <RequestStatusBadge status={sr.status} />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{sr.created}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/service-requests/${sr.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-slate-600 hover:text-slate-900">
                        View
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
