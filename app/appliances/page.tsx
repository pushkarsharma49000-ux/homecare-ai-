'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Tv,
  Search,
  ChevronRight,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WarrantyBadge } from '@/components/ui/StatusBadge';
import { Appliance, ApplianceType } from '@/types';
import { getAppliances } from '@/lib/services/appliances';

export default function AppliancesPage() {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const fetchAppliances = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAppliances();
      setAppliances(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load appliances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliances();
  }, []);

  const filteredAppliances = useMemo(() => {
    return appliances.filter((app) => {
      const matchesSearch =
        searchTerm === '' ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === 'All' || app.type === selectedType;
      const matchesStatus = selectedStatus === 'All' || app.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [appliances, searchTerm, selectedType, selectedStatus]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedStatus('All');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appliance Registry</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tracked customer hardware units, serial numbers, warranties, and maintenance lifecycles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {filteredAppliances.length} of {appliances.length} Appliances Registered
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAppliances}
            disabled={loading}
            className="text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
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
              placeholder="Search by appliance ID, model, brand, customer, or serial number..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Air Conditioner">Air Conditioner</option>
              <option value="Washing Machine">Washing Machine</option>
              <option value="Refrigerator">Refrigerator</option>
              <option value="Television">Television</option>
              <option value="Water Purifier">Water Purifier</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Service">Under Service</option>
              <option value="Inactive">Inactive</option>
              <option value="Warranty Expired">Warranty Expired</option>
            </select>

            {(searchTerm || selectedType !== 'All' || selectedStatus !== 'All') && (
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

      {/* Appliances Table (Section 18) */}
      <Card className="shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500">Querying Supabase appliance registry...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Failed to load appliances</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchAppliances} className="text-xs mt-2">
              Try Again
            </Button>
          </div>
        ) : filteredAppliances.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              {appliances.length === 0 ? 'No appliances in database' : 'No appliances match active filters'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {appliances.length === 0
                ? 'Your Supabase appliances table currently has 0 rows. Run the seed script in Supabase to populate demo data.'
                : 'No registered appliances match your current search and filter selections.'}
            </p>
            {appliances.length > 0 && (
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
                  <th className="px-5 py-3">Appliance ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Brand</th>
                  <th className="px-5 py-3">Model</th>
                  <th className="px-5 py-3">Purchase Date</th>
                  <th className="px-5 py-3">Warranty</th>
                  <th className="px-5 py-3">Last Service</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredAppliances.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">
                      <Link href={`/appliances/${app.id}`} className="hover:underline">
                        {app.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/customers/${app.customerId}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {app.customerName}
                      </Link>
                      <div className="text-[11px] text-slate-400 font-mono">{app.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {app.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800">{app.brand}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{app.model}</td>
                    <td className="px-5 py-3.5 text-slate-500">{app.purchaseDate}</td>
                    <td className="px-5 py-3.5">
                      <WarrantyBadge status={app.warranty} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{app.lastService}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          app.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'Under Service'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/appliances/${app.id}`}>
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
