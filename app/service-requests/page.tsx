'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  RequestStatusBadge,
  PriorityBadge,
} from '@/components/ui/StatusBadge';
import { mockServiceRequests } from '@/lib/mock-data/service-requests';
import { ServiceRequestStatus, CallPriority } from '@/types';

export default function ServiceRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedAppliance, setSelectedAppliance] = useState<string>('All');

  // Top metric counters (Section 20)
  const countNew = mockServiceRequests.filter((r) => r.status === 'New').length;
  const countAssigned = mockServiceRequests.filter((r) => r.status === 'Assigned').length;
  const countScheduled = mockServiceRequests.filter((r) => r.status === 'Technician Scheduled').length;
  const countInProgress = mockServiceRequests.filter((r) => r.status === 'In Progress').length;
  const countResolved = mockServiceRequests.filter((r) => r.status === 'Resolved').length;

  const filteredRequests = useMemo(() => {
    return mockServiceRequests.filter((r) => {
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
  }, [searchTerm, selectedStatus, selectedPriority, selectedAppliance]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setSelectedAppliance('All');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Dispatch pipeline and repair order tracking generated from AI inbound voice calls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {filteredRequests.length} of {mockServiceRequests.length} Total Tickets
          </Badge>
        </div>
      </div>

      {/* Top Status Metrics (Section 20) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedStatus(selectedStatus === 'New' ? 'All' : 'New')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedStatus === 'New'
              ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-sky-700 mt-1">{countNew}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Awaiting Assignment</p>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'Assigned' ? 'All' : 'Assigned')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedStatus === 'Assigned'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{countAssigned}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Technician Allocated</p>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'Technician Scheduled' ? 'All' : 'Technician Scheduled')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedStatus === 'Technician Scheduled'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Scheduled</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{countScheduled}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Time Slot Booked</p>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'In Progress' ? 'All' : 'In Progress')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedStatus === 'In Progress'
              ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <Wrench className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-700 mt-1">{countInProgress}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Technician on Site</p>
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'Resolved' ? 'All' : 'Resolved')}
          className={`p-3.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
            selectedStatus === 'Resolved'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{countResolved}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Signed Off by Client</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Request ID (SR-...), customer name, technician, or issue..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Dropdown */}
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

            {/* Priority Dropdown */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            {/* Appliance Dropdown */}
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

            {(searchTerm || selectedStatus !== 'All' || selectedPriority !== 'All' || selectedAppliance !== 'All') && (
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

      {/* Service Requests Table (Section 20) */}
      <Card className="shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No service requests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No service orders match your selected filters. Reset filters to view all records.
            </p>
            <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs mt-2">
              Reset Filters
            </Button>
          </div>
        ) : (
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
                  <th className="px-5 py-3">Assigned Technician</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRequests.map((sr) => (
                  <tr key={sr.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">
                      <Link href={`/service-requests/${sr.id}`} className="hover:underline">
                        {sr.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{sr.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{sr.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-800">{sr.appliance}</span>
                      <div className="text-[11px] text-slate-400 truncate max-w-[130px]">{sr.brand}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs truncate text-slate-800 font-normal">
                      {sr.issue}
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={sr.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <RequestStatusBadge status={sr.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {sr.assignedTechnician ? (
                        <div className="flex items-center gap-1 font-medium text-slate-800">
                          <UserCheck className="w-3 h-3 text-indigo-600" />
                          <span className="truncate max-w-[130px]">{sr.assignedTechnician}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{sr.created}</td>
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
