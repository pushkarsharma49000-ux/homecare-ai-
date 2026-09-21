import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Headset,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  mockDailyCallVolume,
  mockApplianceBreakdown,
  mockTopProblems,
  mockAIQualityMetrics,
  mockOperationalMetrics,
} from '@/lib/mock-data/analytics';
import { getDashboardKPIs } from '@/lib/services/dashboard';

export default async function AnalyticsPage() {
  const kpiData = await getDashboardKPIs();
  const maxDailyCalls = Math.max(...mockDailyCallVolume.map((d) => d.totalCalls));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Analytics & AI Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">
            Operational KPIs, autonomous resolution rates, and appliance failure telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Last 14 Days Reporting
          </Badge>
        </div>
      </div>

      {/* OPERATIONAL METRICS (Section 23) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 shadow-subtle border-slate-200">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Avg Handling Time</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
            {kpiData.totalCalls > 0 ? kpiData.avgCallDuration : mockOperationalMetrics.averageHandlingTime}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
            {kpiData.totalCalls > 0 ? 'From Supabase' : '↓ 14s vs Target'}
          </span>
        </Card>

        <Card className="p-3.5 shadow-subtle border-slate-200">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">AI Resolution Rate</span>
          <span className="text-xl font-bold text-emerald-600 font-mono mt-1 block">
            {kpiData.totalCalls > 0 ? `${kpiData.aiResolutionRate}%` : mockOperationalMetrics.firstCallResolutionRate}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Autonomous resolution</span>
        </Card>

        <Card className="p-3.5 shadow-subtle border-slate-200">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">First Call Resolution</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">
            {mockOperationalMetrics.firstCallResolutionRate}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">No repeat in 7 days</span>
        </Card>

        <Card className="p-3.5 shadow-subtle border-slate-200">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">SR Creation Rate</span>
          <span className="text-xl font-bold text-blue-600 mt-1 block">
            {mockOperationalMetrics.serviceRequestCreationRate}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Inbound converted</span>
        </Card>

        <Card className="p-3.5 shadow-subtle border-slate-200">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Repeat Call Rate</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {mockOperationalMetrics.repeatCallRate}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Low repeat index</span>
        </Card>

        <Card className="p-3.5 shadow-subtle border-slate-200">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block">Call Answer Speed</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
            {mockOperationalMetrics.callAnswerSpeed}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Browser-based low latency</span>
        </Card>
      </div>

      {/* CALL VOLUME BY DAY & RESOLUTION BREAKDOWN (Section 23) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Call Volume Chart */}
        <Card className="lg:col-span-8 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Support Session Volume & Resolution Trajectory</CardTitle>
              <p className="text-xs text-slate-500">Daily support sessions comparing AI autonomous resolution vs human escalation</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                AI Resolved
              </span>
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                Human Escalated
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-64 flex items-end gap-2 sm:gap-3 px-2">
              {mockDailyCallVolume.map((item) => {
                const totalHeight = (item.totalCalls / maxDailyCalls) * 100;
                const aiResolvedPercent = (item.aiResolved / item.totalCalls) * 100;
                const escalatedPercent = (item.escalated / item.totalCalls) * 100;

                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg whitespace-nowrap">
                      <p className="font-bold">{item.date} ({item.day})</p>
                      <p className="text-blue-300">Total: {item.totalCalls} sessions</p>
                      <p className="text-emerald-300">AI Resolved: {item.aiResolved}</p>
                      <p className="text-rose-300">Escalated: {item.escalated}</p>
                    </div>

                    {/* Stacked Bar */}
                    <div
                      className="w-full rounded-t-md overflow-hidden flex flex-col-reverse justify-end transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${totalHeight}%` }}
                    >
                      <div
                        className="bg-blue-600 w-full"
                        style={{ height: `${aiResolvedPercent}%` }}
                      />
                      <div
                        className="bg-rose-400 w-full"
                        style={{ height: `${escalatedPercent}%` }}
                      />
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {item.date.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI RESOLUTION DONUT & COMPARISON (Section 23) */}
        <Card className="lg:col-span-4 shadow-sm flex flex-col justify-between">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>AI vs Human Resolution</CardTitle>
              <p className="text-xs text-slate-500">Aggregated support resolution share</p>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center justify-center space-y-6">
            {/* Visual Circular Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#2563eb"
                  strokeWidth="12"
                  strokeDasharray={`${82 * 2.51} ${100 * 2.51}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 tracking-tight">82%</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">
                  AI Resolved
                </span>
              </div>
            </div>

            {/* Metric Rows */}
            <div className="w-full space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Resolved by AI
                </span>
                <span className="font-bold text-blue-900">82.3% (121 sessions)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/70 border border-rose-100">
                <span className="font-semibold text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Human Escalation
                </span>
                <span className="font-bold text-rose-900">17.7% (26 sessions)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* APPLIANCE BREAKDOWN & TOP CUSTOMER PROBLEMS (Section 23) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* APPLIANCE BREAKDOWN */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Support Volume by Appliance Category</CardTitle>
              <p className="text-xs text-slate-500">Distribution of support sessions across product lines</p>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {mockApplianceBreakdown.map((item) => (
              <div key={item.appliance} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.appliance}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.count} sessions</span>
                    <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage * 2.5}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* TOP CUSTOMER PROBLEMS */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Top Customer Problems</CardTitle>
              <p className="text-xs text-slate-500">Root complaints diagnosed through voice analysis</p>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {mockTopProblems.map((prob) => (
              <div key={prob.issue} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{prob.issue}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{prob.count} sessions</span>
                    <span className="text-slate-400 font-normal">({prob.percentage}%)</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${(prob.count / 32) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">Primary Appliance: {prob.appliance}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI QUALITY (Section 23) */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Voice Quality & Reliability Benchmarks</span>
            </CardTitle>
            <p className="text-xs text-slate-500">Model accuracy scores and automated diagnostic confidence telemetry</p>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Intent Accuracy</span>
              <span className="text-2xl font-bold text-blue-700 mt-1 block">
                {mockAIQualityMetrics.intentAccuracy}%
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Evaluated across 1,400+ utterances</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Action Accuracy</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                {mockAIQualityMetrics.actionAccuracy}%
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Correct service orders created</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Average AI Confidence</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {mockAIQualityMetrics.averageAIConfidence}%
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Well above 80% safety cutoff</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Escalation Rate</span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">
                {mockAIQualityMetrics.humanEscalationRate}%
              </span>
              <p className="text-[11px] text-slate-500 mt-1">Low manual dispatch dependency</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
