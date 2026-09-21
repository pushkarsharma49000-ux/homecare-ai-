import { ActionItem } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { DbAction } from '@/types/supabase';
import { mapDbActionToActionItem } from './adapters';

/**
 * Action Engine Service Abstraction
 * 
 * Future Architecture:
 * AI Support Agent decides Next Action -> Dispatches structured action to Action Engine
 * -> Action Engine executes business logic against Supabase / ERP / SMS Gateway
 * -> AI Agent receives execution confirmation and replies to caller.
 * 
 * Phase 2B: Structured action retrieval from Supabase `actions` table.
 */

export type ActionType =
  | 'CHECK_CUSTOMER'
  | 'CHECK_APPLIANCE'
  | 'CHECK_WARRANTY'
  | 'CHECK_SERVICE_HISTORY'
  | 'CREATE_SERVICE_REQUEST'
  | 'CHECK_REQUEST_STATUS'
  | 'CREATE_CALLBACK'
  | 'UPDATE_CUSTOMER'
  | 'ESCALATE_HUMAN'
  | 'SEND_CONFIRMATION';

export interface ActionDefinition {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
  category: 'Read' | 'Write' | 'Dispatch' | 'Escalate';
}

export const ACTION_CATALOG: Record<ActionType, ActionDefinition> = {
  CHECK_CUSTOMER: {
    type: 'CHECK_CUSTOMER',
    label: 'Identify Customer',
    description: 'Resolve the customer against registered CRM profiles',
    icon: 'UserCheck',
    category: 'Read',
  },
  CHECK_APPLIANCE: {
    type: 'CHECK_APPLIANCE',
    label: 'Identify Appliance',
    description: 'Match customer verbal description with registered appliance inventory',
    icon: 'Tv',
    category: 'Read',
  },
  CHECK_WARRANTY: {
    type: 'CHECK_WARRANTY',
    label: 'Verify Warranty',
    description: 'Check active warranty, extended warranty, and AMC coverage dates',
    icon: 'ShieldCheck',
    category: 'Read',
  },
  CHECK_SERVICE_HISTORY: {
    type: 'CHECK_SERVICE_HISTORY',
    label: 'Check Service History',
    description: 'Review historical tickets, part replacements, and repeat failure patterns',
    icon: 'History',
    category: 'Read',
  },
  CREATE_SERVICE_REQUEST: {
    type: 'CREATE_SERVICE_REQUEST',
    label: 'Create Service Request',
    description: 'Generate formal repair order and allocate technician visit slot',
    icon: 'Wrench',
    category: 'Write',
  },
  CHECK_REQUEST_STATUS: {
    type: 'CHECK_REQUEST_STATUS',
    label: 'Check Request Status',
    description: 'Query real-time technician GPS location, ETA, and job state',
    icon: 'Clock',
    category: 'Read',
  },
  CREATE_CALLBACK: {
    type: 'CREATE_CALLBACK',
    label: 'Schedule Callback',
    description: 'Queue outbound reminder for support agent at customer-requested hour',
    icon: 'PhoneForwarded',
    category: 'Write',
  },
  UPDATE_CUSTOMER: {
    type: 'UPDATE_CUSTOMER',
    label: 'Update Customer Info',
    description: 'Modify address, alternate phone number, or preferences',
    icon: 'UserCog',
    category: 'Write',
  },
  ESCALATE_HUMAN: {
    type: 'ESCALATE_HUMAN',
    label: 'Escalate to Human Agent',
    description: 'Route the support session to a supervisor or field manager queue',
    icon: 'Headset',
    category: 'Escalate',
  },
  SEND_CONFIRMATION: {
    type: 'SEND_CONFIRMATION',
    label: 'Send SMS / WhatsApp Confirmation',
    description: 'Transmit ticket ID, technician details, and OTP verification link',
    icon: 'MessageSquareShare',
    category: 'Dispatch',
  },
};

export async function getActionCatalog(): Promise<ActionDefinition[]> {
  return Object.values(ACTION_CATALOG);
}

export async function getActions(): Promise<ActionItem[]> {
  try {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching actions:', error.message);
      return [];
    }

    return (data || []).map((a: DbAction) => mapDbActionToActionItem(a));
  } catch (err) {
    console.error('Unexpected error in getActions:', err);
    return [];
  }
}

export async function getActionsByCallId(callId: string): Promise<ActionItem[]> {
  try {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('call_id', callId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching actions by call_id:', error.message);
      return [];
    }

    return (data || []).map((a: DbAction) => mapDbActionToActionItem(a));
  } catch (err) {
    console.error('Unexpected error in getActionsByCallId:', err);
    return [];
  }
}

export async function getActionsByCustomerId(customerId: string): Promise<ActionItem[]> {
  try {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching actions by customer_id:', error.message);
      return [];
    }

    return (data || []).map((a: DbAction) => mapDbActionToActionItem(a));
  } catch (err) {
    console.error('Unexpected error in getActionsByCustomerId:', err);
    return [];
  }
}

export async function getActionsByServiceRequestId(serviceRequestId: string): Promise<ActionItem[]> {
  try {
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('service_request_id', serviceRequestId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching actions by service_request_id:', error.message);
      return [];
    }

    return (data || []).map((a: DbAction) => mapDbActionToActionItem(a));
  } catch (err) {
    console.error('Unexpected error in getActionsByServiceRequestId:', err);
    return [];
  }
}
