import React from 'react';
import { Badge } from '@/components/ui/Badge';
import {
  ServiceRequestStatus,
  CallPriority,
  AIState,
  CallSentiment,
  CallOutcome,
  WarrantyStatus,
} from '@/types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  UserCheck,
  Calendar,
  Activity,
  Smile,
  Meh,
  Frown,
  Radio,
  BrainCircuit,
  Wrench,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const RequestStatusBadge: React.FC<{ status: ServiceRequestStatus }> = ({ status }) => {
  switch (status) {
    case 'New':
      return (
        <Badge variant="default" className="bg-sky-50 text-sky-700 border-sky-200">
          <Clock className="w-3 h-3" />
          New
        </Badge>
      );
    case 'Assigned':
      return (
        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          <UserCheck className="w-3 h-3" />
          Assigned
        </Badge>
      );
    case 'Technician Scheduled':
      return (
        <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">
          <Calendar className="w-3 h-3" />
          Technician Scheduled
        </Badge>
      );
    case 'In Progress':
      return (
        <Badge variant="warning" className="bg-orange-50 text-orange-700 border-orange-200">
          <Wrench className="w-3 h-3 animate-spin" />
          In Progress
        </Badge>
      );
    case 'Resolved':
      return (
        <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Resolved
        </Badge>
      );
    case 'Closed':
      return (
        <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200">
          Closed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const PriorityBadge: React.FC<{ priority: CallPriority }> = ({ priority }) => {
  switch (priority) {
    case 'Low':
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
          Low
        </Badge>
      );
    case 'Medium':
      return (
        <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
          Medium
        </Badge>
      );
    case 'High':
      return (
        <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-300 font-semibold">
          <AlertTriangle className="w-3 h-3" />
          High
        </Badge>
      );
    case 'Critical':
      return (
        <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-300 font-bold">
          <AlertCircle className="w-3 h-3" />
          Critical
        </Badge>
      );
    default:
      return <Badge>{priority}</Badge>;
  }
};

export const AIStateBadge: React.FC<{ state: AIState }> = ({ state }) => {
  switch (state) {
    case 'Listening':
      return (
        <Badge variant="live" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
          Listening
        </Badge>
      );
    case 'Thinking':
      return (
        <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">
          <BrainCircuit className="w-3 h-3 animate-pulse text-amber-600" />
          Thinking
        </Badge>
      );
    case 'Taking Action':
      return (
        <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
          <Activity className="w-3 h-3 animate-pulse text-blue-600" />
          Taking Action
        </Badge>
      );
    case 'Escalated':
      return (
        <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Escalated
        </Badge>
      );
    case 'Completed':
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
          Completed
        </Badge>
      );
    default:
      return <Badge>{state}</Badge>;
  }
};

export const SentimentBadge: React.FC<{ sentiment: CallSentiment }> = ({ sentiment }) => {
  switch (sentiment) {
    case 'Positive':
      return (
        <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <Smile className="w-3 h-3" />
          Positive
        </Badge>
      );
    case 'Neutral':
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
          <Meh className="w-3 h-3" />
          Neutral
        </Badge>
      );
    case 'Frustrated':
      return (
        <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">
          <Frown className="w-3 h-3" />
          Frustrated
        </Badge>
      );
  }
};

export const OutcomeBadge: React.FC<{ outcome: CallOutcome }> = ({ outcome }) => {
  switch (outcome) {
    case 'Resolved by AI':
      return (
        <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          Resolved by AI
        </Badge>
      );
    case 'Service Request Created':
      return (
        <Badge variant="default" className="bg-blue-50 text-blue-700 border-blue-200">
          <Wrench className="w-3 h-3" />
          Service Request Created
        </Badge>
      );
    case 'Human Escalation':
      return (
        <Badge variant="destructive" className="bg-rose-50 text-rose-700 border-rose-200">
          <AlertCircle className="w-3 h-3" />
          Human Escalation
        </Badge>
      );
    case 'Callback Required':
      return (
        <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3" />
          Callback Required
        </Badge>
      );
  }
};

export const WarrantyBadge: React.FC<{ status: WarrantyStatus }> = ({ status }) => {
  switch (status) {
    case 'Active':
      return (
        <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          Warranty Active
        </Badge>
      );
    case 'Expiring Soon':
      return (
        <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3" />
          Expiring Soon
        </Badge>
      );
    case 'Expired':
      return (
        <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200">
          <ShieldAlert className="w-3 h-3" />
          Warranty Expired
        </Badge>
      );
  }
};
