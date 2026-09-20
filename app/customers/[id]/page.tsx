import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Tv,
  Wrench,
  Clock,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  RequestStatusBadge,
  PriorityBadge,
  WarrantyBadge,
  SentimentBadge,
  OutcomeBadge,
} from '@/components/ui/StatusBadge';
import { getCustomerById } from '@/lib/services/customers';
import { getAppliancesByCustomerId } from '@/lib/services/appliances';
import { getServiceRequestsByCustomerId } from '@/lib/services/service-requests';
import { getCallsByCustomerId } from '@/lib/services/calls';

interface Props {
  params: {
    id: string;
  };
}

export default async function Customer360Page({ params }: Props) {
  const customer = await getCustomerById(params.id);

  if (!customer) {
    notFound();
  }

  const [appliances, serviceRequests, calls] = await Promise.all([
    getAppliancesByCustomerId(customer.id),
    getServiceRequestsByCustomerId(customer.id),
    getCallsByCustomerId(customer.id),
  ]);

  const openRequests = serviceRequests.filter((r) => r.status !== 'Resolved' && r.status !== 'Closed');

  return (
    <div className="space-y-6">
      {/* Back Button and Navigation */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <Link href="/customers">
          <Button variant="outline" size="sm" className="h-8 px-2.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Customers</span>
          </Button>
        </Link>
        <span className="font-mono text-xs text-slate-400">ID: {customer.id}</span>
      </div>

      {/* Customer Header Summary (Section 17) */}
      <Card className="shadow-sm">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {customer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
                  <Badge variant={customer.status === 'VIP' ? 'warning' : 'secondary'} className="text-xs">
                    {customer.status} Customer
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="font-mono font-medium flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {customer.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Customer since: {customer.customerSince}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {customer.city}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Stat Counters */}
            <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
              <div className="text-center px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xl font-bold text-slate-900">{appliances.length}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Registered Units
                </span>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xl font-bold text-blue-600">{openRequests.length}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Open Requests
                </span>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xl font-bold text-slate-900">{calls.length}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Total Calls
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Contact Info & Open Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CONTACT INFORMATION (Section 17) */}
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-sm">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Full Name</span>
              <span className="font-semibold text-slate-800 text-sm">{customer.name}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Inbound Phone</span>
              <span className="font-mono text-slate-800 font-semibold">{customer.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Email Address</span>
              <span className="text-slate-700">{customer.email}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">City / Territory</span>
              <span className="text-slate-700">{customer.city}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Service Address</span>
              <span className="text-slate-700 leading-relaxed block mt-0.5">{customer.address}</span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Account Status</span>
              <span className="inline-block mt-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {customer.status} • High Satisfaction
              </span>
            </div>
          </CardContent>
        </Card>

        {/* OPEN SERVICE REQUESTS (Section 17) */}
        <Card className="lg:col-span-8 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm">Open Service Requests ({openRequests.length})</CardTitle>
            </div>
            <Link href="/service-requests" className="text-xs text-blue-600 hover:underline">
              All Requests →
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {openRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No open service requests for this customer. All historical tickets are closed.
              </div>
            ) : (
              <div className="space-y-3">
                {openRequests.map((sr) => (
                  <div
                    key={sr.id}
                    className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/service-requests/${sr.id}`}
                          className="font-mono font-bold text-blue-700 text-sm hover:underline"
                        >
                          {sr.id}
                        </Link>
                        <RequestStatusBadge status={sr.status} />
                        <PriorityBadge priority={sr.priority} />
                      </div>
                      <p className="font-semibold text-slate-900 text-xs">{sr.issue}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sr.appliance} • {sr.brand} ({sr.model}) • Created {sr.created}
                      </p>
                    </div>

                    <Link href={`/service-requests/${sr.id}`}>
                      <Button size="sm" variant="outline" className="text-xs self-start">
                        Ticket Detail →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* REGISTERED APPLIANCES (Section 17) */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">Registered Appliances ({appliances.length})</CardTitle>
          </div>
          <span className="text-xs text-slate-500">Linked to customer profile for automatic recognition</span>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {appliances.map((app) => (
              <Card key={app.id} className="border border-slate-200 hover:border-blue-300 transition-colors">
                <div className="p-4 flex flex-col justify-between h-full space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                        {app.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{app.brand}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{app.model}</p>
                    </div>
                    <WarrantyBadge status={app.warranty} />
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    {app.capacity && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Spec / Capacity:</span>
                        <span className="font-medium text-slate-800">{app.capacity}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Purchased:</span>
                      <span>{app.purchaseDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Warranty Until:</span>
                      <span className="font-semibold text-slate-800">{app.warrantyExpiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Service:</span>
                      <span>{app.lastService}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/appliances/${app.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">
                        View Appliance Details →
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SERVICE HISTORY TIMELINE & RECENT CALLS (Section 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service History Timeline */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-sm">Service History Timeline</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative pl-6 border-l-2 border-blue-200 space-y-6 my-2">
              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-blue-600 absolute -left-[31px] top-0.5 ring-4 ring-white" />
                <span className="text-[11px] font-semibold text-blue-600 font-mono">20 Sep 2026</span>
                <h5 className="text-xs font-bold text-slate-900 mt-0.5">Washing Machine — Excessive Vibration</h5>
                <p className="text-xs text-slate-500 mt-0.5">
                  Service Request <span className="font-mono font-semibold text-blue-600">SR-10482</span> created via AI Inbound Call. Status: New
                </p>
              </div>

              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -left-[31px] top-0.5 ring-4 ring-white" />
                <span className="text-[11px] font-semibold text-slate-400 font-mono">18 Sep 2026</span>
                <h5 className="text-xs font-bold text-slate-900 mt-0.5">Washing Machine — Installation Completed</h5>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authorized technician visit completed. Transit bolts removed and calibration passed.
                </p>
              </div>

              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-slate-300 absolute -left-[31px] top-0.5 ring-4 ring-white" />
                <span className="text-[11px] font-semibold text-slate-400 font-mono">12 Apr 2026</span>
                <h5 className="text-xs font-bold text-slate-900 mt-0.5">Air Conditioner — Annual Maintenance Check</h5>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-summer preventative deep jet clean and refrigerant test performed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Calls */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-sm">Recent Customer Calls ({calls.length})</CardTitle>
            </div>
            <Link href="/calls" className="text-xs text-blue-600 hover:underline">
              All Calls →
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            {calls.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 text-center">No recent calls recorded</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {calls.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/calls/${c.id}`} className="font-mono font-semibold text-blue-600 hover:underline">
                          {c.id}
                        </Link>
                        <OutcomeBadge outcome={c.outcome} />
                      </div>
                      <p className="text-slate-800 font-medium mt-1">{c.issue}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {c.date} • Duration: {c.duration}
                      </p>
                    </div>

                    <Link href={`/calls/${c.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-blue-600">
                        Details →
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
