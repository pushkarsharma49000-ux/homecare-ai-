'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronRight,
  Phone,
  MapPin,
  Tv,
  Wrench,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Customer } from '@/types';
import { getCustomers } from '@/lib/services/customers';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [cityFilter, setCityFilter] = useState<string>('All');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomers();
      setCustomers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Unique cities list for filtering
  const cities = useMemo(() => {
    const list = Array.from(new Set(customers.map((c) => c.city).filter(Boolean)));
    return list.sort();
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchTerm === '' ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || customer.status === statusFilter;

      const matchesCity =
        cityFilter === 'All' || customer.city === cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [customers, searchTerm, statusFilter, cityFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCityFilter('All');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered homeowners and their linked home-appliance profiles across India
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {filteredCustomers.length} of {customers.length} Profiles
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCustomers}
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
              placeholder="Search customer name, phone number (+91...), city, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Tiers</option>
              <option value="Active">Active</option>
              <option value="VIP">VIP</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {(searchTerm || statusFilter !== 'All' || cityFilter !== 'All') && (
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

      {/* Customer Table */}
      <Card className="shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500">Querying Supabase customer registry...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Failed to load customers</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchCustomers} className="text-xs mt-2">
              Try Again
            </Button>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              {customers.length === 0 ? 'No customer records in database' : 'No customers match active filters'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {customers.length === 0
                ? 'Your Supabase customers table currently has 0 rows. Run the seed script in Supabase to populate demo data.'
                : 'No registered profiles match your search criteria. Try adjusting your query.'}
            </p>
            {customers.length > 0 && (
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
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Active Appliances</th>
                  <th className="px-5 py-3">Open Requests</th>
                  <th className="px-5 py-3">Last Contact</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {customer.name}
                        </Link>
                        {customer.status === 'VIP' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{customer.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-600">{customer.phone}</td>
                    <td className="px-5 py-3.5 text-slate-600">{customer.city}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        <Tv className="w-3 h-3 text-slate-400" />
                        {customer.activeAppliancesCount} units
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {customer.openRequestsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                          <Wrench className="w-3 h-3" />
                          {customer.openRequestsCount} Open
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{customer.lastContact}</td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={customer.status === 'VIP' ? 'warning' : 'secondary'}
                        className="text-[11px]"
                      >
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-blue-600 hover:text-blue-700">
                          <span>360 View</span>
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
