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
  Activity,
  CheckCircle2,
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
import { getActionsByCustomerId } from '@/lib/services/actions';

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

  const [appliances, serviceRequests, calls, actions] = await Promise.all([
    getAppliancesByCustomerId(customer.id),
    getServiceRequestsByCustomerId(customer.id),
    getCallsByCustomerId(customer.id),
    getActionsByCustomerId(customer.id),
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
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {customer.email || 'No email registered'}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {customer.city}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Member since {customer.customerSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
              <div className="text-center px-3">
                <span className="text-2xl font-bold text-slate-900">{appliances.length}</span>
                <span className="text-[11px] text-slate-500 block font-medium">Appliances</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center px-3">
                <span className="text-2xl font-bold text-indigo-600">{openRequests.length}</span>
                <span className="text-[11px] text-slate-500 block font-medium">Open Requests</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center px-3">
                <span className="text-2xl font-bold text-slate-700">{calls.length}</span>
                <span className="text-[11px] text-slate-500 block font-medium">Sessions Logged</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* REGISTERED APPLIANCES (Section 17) */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-blue-600" />
            <CardTitle>Registered Appliances ({appliances.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {appliances.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p className="text-sm font-medium text-slate-700">No appliances registered for this customer</p>
              <p className="text-xs text-slate-400 mt-1">Appliances linked to customer profile in Supabase will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {appliances.map((app) => (
                <Card key={app.id} className="p-4 border-slate-200 hover:border-blue-300 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide block">
                          {app.type}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                          {app.brand} {app.model}
                        </h4>
                      </div>
                      <WarrantyBadge status={app.warranty} />
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Serial No:</span>
                        <span className="text-slate-800 font-semibold">{app.serialNumber}</span>
                      </div>
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
          )}
        </CardContent>
      </Card>

      {/* SERVICE HISTORY & RECENT CALLS & ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service Requests Timeline */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-sm">Service Requests ({serviceRequests.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {serviceRequests.length === 0 ? (
              <p className="text-xs text-slate-400 p-6 text-center">No service requests recorded</p>
            ) : (
              <div className="relative pl-6 border-l-2 border-blue-200 space-y-6 my-2">
                {serviceRequests.map((sr) => (
                  <div key={sr.id} className="relative">
                    <span className="w-3 h-3 rounded-full bg-blue-600 absolute -left-[31px] top-0.5 ring-4 ring-white" />
                    <span className="text-[11px] font-semibold text-blue-600 font-mono">{sr.created}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h5 className="text-xs font-bold text-slate-900">{sr.appliance} — {sr.issue}</h5>
                      <RequestStatusBadge status={sr.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Request <Link href={`/service-requests/${sr.id}`} className="font-mono font-semibold text-blue-600 hover:underline">{sr.id}</Link>
                      {sr.assignedTechnician ? ` • Tech: ${sr.assignedTechnician}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Calls & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-slate-500" />
                <CardTitle className="text-sm">Customer Sessions ({calls.length})</CardTitle>
              </div>
              <Link href="/calls" className="text-xs text-blue-600 hover:underline">
                All Calls →
              </Link>
            </CardHeader>
            <CardContent className="pt-3">
              {calls.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No recent sessions recorded</p>
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

          {/* Actions Log */}
          {actions.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-sm">Customer Actions ({actions.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="divide-y divide-slate-100 text-xs">
                  {actions.map((act) => (
                    <div key={act.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-semibold text-slate-700">{act.action}</span>
                        <p className="text-slate-500 text-[11px]">{act.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400">{act.timestamp}</span>
                        {act.completed ? (
                          <span className="text-emerald-600 flex items-center gap-1 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold text-[11px]">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
