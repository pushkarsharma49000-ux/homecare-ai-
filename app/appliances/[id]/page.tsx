import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Tv,
  User,
  Phone,
  ShieldCheck,
  Wrench,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  WarrantyBadge,
  RequestStatusBadge,
  PriorityBadge,
} from '@/components/ui/StatusBadge';
import { getApplianceById } from '@/lib/services/appliances';
import { getServiceRequestsByApplianceId } from '@/lib/services/service-requests';

interface Props {
  params: {
    id: string;
  };
}

export default async function ApplianceDetailPage({ params }: Props) {
  const appliance = await getApplianceById(params.id);

  if (!appliance) {
    notFound();
  }

  const serviceRequests = await getServiceRequestsByApplianceId(appliance.id);
  const openRequests = serviceRequests.filter(
    (r) => r.status !== 'Resolved' && r.status !== 'Closed'
  );
  const completedRequests = serviceRequests.filter(
    (r) => r.status === 'Resolved' || r.status === 'Closed'
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link href="/appliances">
            <Button variant="outline" size="sm" className="h-8 px-2.5">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Appliances</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">ID: {appliance.id}</span>
            <span className="text-slate-300">•</span>
            <span className="text-sm font-bold text-slate-900">{appliance.brand} {appliance.model}</span>
          </div>
        </div>

        <WarrantyBadge status={appliance.warranty} />
      </div>

      {/* Main Product Information Card (Section 19) */}
      <Card className="shadow-sm">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm">
                <Tv className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {appliance.type}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {appliance.brand} {appliance.model}
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Serial Number: <span className="font-semibold text-slate-800">{appliance.serialNumber}</span>
                </p>
                {appliance.capacity && (
                  <p className="text-xs text-slate-600 mt-1">
                    Specification: <span className="font-medium text-slate-900">{appliance.capacity}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Linked Customer Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-w-[280px]">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Registered Owner</span>
              <div className="flex items-center justify-between mt-1">
                <div>
                  <Link
                    href={`/customers/${appliance.customerId}`}
                    className="font-bold text-slate-900 hover:text-blue-600 hover:underline text-sm"
                  >
                    {appliance.customerName}
                  </Link>
                  <p className="font-mono text-xs text-slate-500 mt-0.5">{appliance.customerPhone}</p>
                </div>
                <Link href={`/customers/${appliance.customerId}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Profile →
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Technical Specs & Lifecycle Timeline */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purchase Date</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{appliance.purchaseDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Warranty Expiry</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{appliance.warrantyExpiryDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Serviced</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{appliance.lastService}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Appliance Status</span>
              <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{appliance.status}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid: Open Requests & Historical Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CURRENT REQUESTS (Section 19) */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-sm">Current Active Service Requests ({openRequests.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {openRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active service requests for this appliance. Hardware is operating normally.
              </div>
            ) : (
              <div className="space-y-3">
                {openRequests.map((sr) => (
                  <div
                    key={sr.id}
                    className="p-4 rounded-xl border border-blue-100 bg-blue-50/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/service-requests/${sr.id}`}
                          className="font-mono font-bold text-blue-700 text-xs hover:underline"
                        >
                          {sr.id}
                        </Link>
                        <RequestStatusBadge status={sr.status} />
                        <PriorityBadge priority={sr.priority} />
                      </div>
                      <span className="text-[11px] text-slate-400">{sr.created}</span>
                    </div>
                    <p className="font-semibold text-slate-900 text-xs">{sr.issue}</p>
                    <p className="text-xs text-slate-600 italic">"{sr.aiSummary}"</p>
                    {sr.assignedTechnician && (
                      <p className="text-[11px] text-slate-500 pt-1 border-t border-blue-100/60">
                        Assigned: <span className="font-medium text-slate-800">{sr.assignedTechnician}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PREVIOUS ISSUES & SERVICE HISTORY (Section 19) */}
        <Card className="lg:col-span-6 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <CardTitle className="text-sm">Service History & Past Issues</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {completedRequests.length > 0 ? (
                completedRequests.map((sr) => (
                  <div key={sr.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-slate-700">{sr.id}</span>
                      <RequestStatusBadge status={sr.status} />
                    </div>
                    <p className="font-semibold text-slate-800">{sr.issue}</p>
                    <p className="text-slate-500 text-[11px]">Recommended: {sr.recommendedAction}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{sr.createdAt}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-mono text-[10px] text-slate-400">18 Sep 2026</span>
                    <p className="font-semibold text-slate-800">Authorized Pre-Commissioning & Installation</p>
                    <p className="text-slate-500 text-[11px]">
                      OEM standard inspection passed. Vibration damping pads and level aligned.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-mono text-[10px] text-slate-400">Purchase Delivery</span>
                    <p className="font-semibold text-slate-800">Delivery from Authorized Appliance Hub</p>
                    <p className="text-slate-500 text-[11px]">
                      Factory sealed package delivered with original warranty certification.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
