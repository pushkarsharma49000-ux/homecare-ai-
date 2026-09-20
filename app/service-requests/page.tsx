'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Search,
  ChevronRight,
  Filter,
  Clock,
  UserCheck,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  RequestStatusBadge,
  PriorityBadge,
} from '@/components/ui/StatusBadge';
import { ServiceRequest, ServiceRequestStatus, CallPriority } from '@/types';
import { getServiceRequests } from '@/lib/services/service-requests';

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedAppliance, setSelectedAppliance] = useState<string>('All');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceRequests();
      setRequests(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Top metric counters (Section 20)
  const countNew = requests.filter((r) => r.status === 'New').length;
  const countAssigned = requests.filter((r) => r.status === 'Assigned').length;
  const countScheduled = requests.filter((r) => r.status === 'Technician Scheduled').length;
  const countInProgress = requests.filter((r) => r.status === 'In Progress').length;
  const countResolved = requests.filter((r) => r.status === 'Resolved').length;

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesSearch =
        searchTerm === '' ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.assignedTechnician && r.assignedTechnician.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = selectedStatus === 'All' || r.status === selectedStatus;
      const matchesPriority = selectedPriority === 'All' || r.priority === selectedPriority;
      const matchesAppliance = selectedAppliance === 'All' || r.appliance === selectedAppliance;

      return matchesSearch && matchesStatus && matchesPriority && matchesAppliance;
    });
  }, [requests, searchTerm, selectedStatus, selectedPriority, selectedAppliance]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSelectedAppliance('All');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Requests & Dispatch</h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated ticket pipeline created via inbound AI voice diagnostic workflows
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {filteredRequests.length} of {requests.length} Requests
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
            className="text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric Cards Ribbon (Section 20) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="p-3.5 bg-blue-50/50 border-blue-100">
          <span className="text-xs text-blue-700 font-medium">New / Unassigned</span>
          <span className="text-2xl font-bold text-blue-900 mt-1 block">{countNew}</span>
          <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">Awaiting tech allocation</span>
        </Card>

        <Card className="p-3.5 bg-indigo-50/50 border-indigo-100">
          <span className="text-xs text-indigo-700 font-medium">Technician Assigned</span>
          <span className="text-2xl font-bold text-indigo-900 mt-1 block">{countAssigned}</span>
          <span className="text-[10px] text-indigo-600 font-medium mt-0.5 block">Assigned to field team</span>
        </Card>

        <Card className="p-3.5 bg-purple-50/50 border-purple-100">
          <span className="text-xs text-purple-700 font-medium">Visit Scheduled</span>
          <span className="text-2xl font-bold text-purple-900 mt-1 block">{countScheduled}</span>
          <span className="text-[10px] text-purple-600 font-medium mt-0.5 block">Time slot confirmed</span>
        </Card>

        <Card className="p-3.5 bg-amber-50/50 border-amber-100">
          <span className="text-xs text-amber-700 font-medium">In Progress</span>
          <span className="text-2xl font-bold text-amber-900 mt-1 block">{countInProgress}</span>
          <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">Active on-site inspection</span>
        </Card>

        <Card className="p-3.5 bg-emerald-50/50 border-emerald-100">
          <span className="text-xs text-emerald-700 font-medium">Resolved</span>
          <span className="text-2xl font-bold text-emerald-900 mt-1 block">{countResolved}</span>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Successfully repaired</span>
        </Card>
      </div>

      {/* Filter and Search Bar (Section 21) */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search request ID (SR-...), customer name, technician, or issue..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="Technician Scheduled">Technician Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

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

            {(searchTerm ||
              selectedStatus !== 'All' ||
              selectedPriority !== 'All' ||
              selectedAppliance !== 'All') && (
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

      {/* Service Requests Table (Section 21) */}
      <Card className="shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500">Querying Supabase service requests...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Failed to load service requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchRequests} className="text-xs mt-2">
              Try Again
            </Button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              {requests.length === 0 ? 'No service requests in database' : 'No requests match active filters'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {requests.length === 0
                ? 'Your Supabase service_requests table currently has 0 rows. Run the seed script in Supabase to populate demo data.'
                : 'No service requests found matching your query. Try resetting filters.'}
            </p>
            {requests.length > 0 && (
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
                  <th className="px-5 py-3">Request ID & Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Appliance</th>
                  <th className="px-5 py-3">Reported Issue</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Assigned Technician</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRequests.map((sr) => (
                  <tr key={sr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-semibold text-blue-600">
                        <Link href={`/service-requests/${sr.id}`} className="hover:underline">
                          {sr.id}
                        </Link>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{sr.created}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/customers/${sr.customerId}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {sr.customerName}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">{sr.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-900">{sr.appliance}</div>
                      <div className="text-[11px] text-slate-400">{sr.brand} {sr.model}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-800">
                      {sr.issue}
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={sr.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <RequestStatusBadge status={sr.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {sr.assignedTechnician ? (
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium">{sr.assignedTechnician}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/service-requests/${sr.id}`}>
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
