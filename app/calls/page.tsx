'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  SentimentBadge,
  OutcomeBadge,
  PriorityBadge,
} from '@/components/ui/StatusBadge';
import { Call, ApplianceType, CallIntent, CallSentiment, CallOutcome } from '@/types';
import { getCalls } from '@/lib/services/calls';

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppliance, setSelectedAppliance] = useState<string>('All');
  const [selectedIntent, setSelectedIntent] = useState<string>('All');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('All');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('All');

  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCalls();
      setCalls(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load calls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const filteredCalls = useMemo(() => {
    return calls.filter((call) => {
      // Search matching
      const matchesSearch =
        searchTerm === '' ||
        call.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        call.issue.toLowerCase().includes(searchTerm.toLowerCase());

      // Appliance matching
      const matchesAppliance =
        selectedAppliance === 'All' || call.appliance === selectedAppliance;

      // Intent matching
      const matchesIntent =
        selectedIntent === 'All' || call.intent === selectedIntent;

      // Sentiment matching
      const matchesSentiment =
        selectedSentiment === 'All' || call.sentiment === selectedSentiment;

      // Outcome matching
      const matchesOutcome =
        selectedOutcome === 'All' || call.outcome === selectedOutcome;

      return (
        matchesSearch &&
        matchesAppliance &&
        matchesIntent &&
        matchesSentiment &&
        matchesOutcome
      );
    });
  }, [
    calls,
    searchTerm,
    selectedAppliance,
    selectedIntent,
    selectedSentiment,
    selectedOutcome,
  ]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedAppliance('All');
    setSelectedIntent('All');
    setSelectedSentiment('All');
    setSelectedOutcome('All');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Session History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit log of customer conversations, AI resolutions, and transcript analyses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {filteredCalls.length} of {calls.length} Sessions Recorded
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCalls}
            disabled={loading}
            className="text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar (Section 13) */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by caller name, phone number, call ID, or issue..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Appliance Filter */}
            <select
              value={selectedAppliance}
              onChange={(e) => setSelectedAppliance(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Appliances</option>
              <option value="Air Conditioner">Air Conditioner</option>
              <option value="Washing Machine">Washing Machine</option>
              <option value="Refrigerator">Refrigerator</option>
              <option value="Television">Television</option>
              <option value="Water Purifier">Water Purifier</option>
            </select>

            {/* Intent Filter */}
            <select
              value={selectedIntent}
              onChange={(e) => setSelectedIntent(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Intents</option>
              <option value="Product Issue">Product Issue</option>
              <option value="Order Status">Order Status</option>
              <option value="Installation">Installation</option>
              <option value="Warranty">Warranty</option>
              <option value="Refund">Refund</option>
              <option value="Human Agent">Human Agent</option>
            </select>

            {/* Sentiment Filter */}
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Frustrated">Frustrated</option>
            </select>

            {/* Outcome Filter */}
            <select
              value={selectedOutcome}
              onChange={(e) => setSelectedOutcome(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Outcomes</option>
              <option value="Resolved by AI">Resolved by AI</option>
              <option value="Service Request Created">Service Request Created</option>
              <option value="Human Escalation">Human Escalation</option>
              <option value="Callback Required">Callback Required</option>
            </select>

            {(searchTerm ||
              selectedAppliance !== 'All' ||
              selectedIntent !== 'All' ||
              selectedSentiment !== 'All' ||
              selectedOutcome !== 'All') && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-slate-600 gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Calls Table (Section 14) */}
      <Card className="shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500">Querying Supabase calls registry...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Failed to load calls</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchCalls} className="text-xs mt-2">
              Try Again
            </Button>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              {calls.length === 0 ? 'No calls recorded in database' : 'No calls match active filters'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {calls.length === 0
                ? 'Your Supabase calls table currently has 0 rows. Run the seed script in Supabase to populate demo data.'
                : 'No calls found matching your specified criteria. Try clearing some filters.'}
            </p>
            {calls.length > 0 && (
              <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs mt-2">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Call ID & Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Appliance</th>
                  <th className="px-5 py-3">Intent</th>
                  <th className="px-5 py-3">Duration</th>
                  <th className="px-5 py-3">Sentiment</th>
                  <th className="px-5 py-3">Outcome</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-semibold text-blue-600 flex items-center gap-1.5">
                        <Link href={`/calls/${call.id}`} className="hover:underline">
                          {call.id}
                        </Link>
                        {call.isLive && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{call.date}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/customers/${call.customerId}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {call.customerName}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">{call.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {call.appliance}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block font-medium text-slate-800">
                        {call.intent}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{call.duration}</td>
                    <td className="px-5 py-3.5">
                      <SentimentBadge sentiment={call.sentiment} />
                    </td>
                    <td className="px-5 py-3.5">
                      <OutcomeBadge outcome={call.outcome} />
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={call.priority} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/calls/${call.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-blue-600 hover:text-blue-700">
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
