import {
  Customer,
  Appliance,
  Call,
  TranscriptMessage,
  CallAnalysis,
  ActionItem,
  ServiceRequest,
  ServiceRequestTimelineEvent,
  KnowledgeDocument,
  AgentConfiguration,
  ApplianceType,
  ApplianceStatus,
  WarrantyStatus,
  CallSentiment,
  CallOutcome,
  CallIntent,
  CallPriority,
  AIState,
  KnowledgeCategory,
} from '@/types';
import {
  DbCustomer,
  DbAppliance,
  DbCall,
  DbTranscript,
  DbCallAnalysis,
  DbServiceRequest,
  DbAction,
  DbKnowledgeDocument,
  DbAgentConfiguration,
} from '@/types/supabase';

// Normalize appliance type strings
export function normalizeApplianceType(val: string | null | undefined): ApplianceType {
  if (!val) return 'Air Conditioner';
  const clean = val.toLowerCase().replace(/_/g, ' ');
  if (clean.includes('air') || clean.includes('ac')) return 'Air Conditioner';
  if (clean.includes('wash')) return 'Washing Machine';
  if (clean.includes('refrig') || clean.includes('fridge')) return 'Refrigerator';
  if (clean.includes('tele') || clean.includes('tv')) return 'Television';
  if (clean.includes('water') || clean.includes('purif')) return 'Water Purifier';
  return 'Air Conditioner';
}

// Compute warranty status from dates
export function computeWarrantyStatus(
  warrantyEndDate: string | null | undefined
): WarrantyStatus {
  if (!warrantyEndDate) return 'Expired';
  const end = new Date(warrantyEndDate);
  const now = new Date();
  if (isNaN(end.getTime())) return 'Active';
  if (end < now) return 'Expired';
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) return 'Expiring Soon';
  return 'Active';
}

// Format seconds into MM:SS
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Map DbCustomer -> Customer
export function mapDbCustomerToCustomer(
  row: DbCustomer,
  appliancesCount = 0,
  openRequestsCount = 0,
  lastContact?: string
): Customer {
  return {
    id: row.id,
    name: row.name || 'Unknown Customer',
    phone: row.phone || 'N/A',
    email: row.email || '',
    city: row.city || 'India',
    address: `${row.city || 'Metro City'}, India`,
    status: (row.status as 'Active' | 'VIP' | 'Inactive') || 'Active',
    customerSince: row.created_at
      ? new Date(row.created_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
        })
      : 'Recent',
    activeAppliancesCount: appliancesCount,
    openRequestsCount: openRequestsCount,
    lastContact: lastContact || (row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : 'Recent'),
  };
}

// Map DbAppliance -> Appliance
export function mapDbApplianceToAppliance(
  row: DbAppliance,
  customer?: DbCustomer | null
): Appliance {
  const warranty = computeWarrantyStatus(row.warranty_end_date);
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: customer?.name || 'Registered Customer',
    customerPhone: customer?.phone || 'N/A',
    type: normalizeApplianceType(row.appliance_type),
    brand: row.brand || 'Generic',
    model: row.model || 'Standard',
    serialNumber: row.serial_number || 'N/A',
    purchaseDate: row.purchase_date || 'N/A',
    warranty,
    warrantyExpiryDate: row.warranty_end_date || 'N/A',
    lastService: row.last_service_date || 'N/A',
    status: (row.status as ApplianceStatus) || (warranty === 'Expired' ? 'Warranty Expired' : 'Active'),
  };
}

// Map DbTranscript -> TranscriptMessage
export function mapDbTranscriptToMessage(row: DbTranscript): TranscriptMessage {
  return {
    id: row.id,
    speaker: (row.speaker === 'customer' ? 'customer' : 'ai') as 'ai' | 'customer',
    message: row.text || '',
    timestamp: formatDuration(row.timestamp_seconds),
    confidence: 95,
  };
}

// Map DbCallAnalysis -> CallAnalysis
export function mapDbCallAnalysisToAnalysis(
  row: DbCallAnalysis | null | undefined,
  applianceType?: ApplianceType
): CallAnalysis {
  if (!row) {
    return {
      intent: 'Product Issue',
      appliance: applianceType || 'Air Conditioner',
      issue: 'Inbound diagnostic inquiry',
      sentiment: 'Neutral',
      priority: 'Medium',
      confidence: 85,
      summary: 'Call in progress or pending AI diagnostic summary.',
    };
  }

  return {
    intent: (row.intent as CallIntent) || 'Product Issue',
    appliance: normalizeApplianceType(row.category || applianceType || 'Air Conditioner'),
    issue: row.issue || row.summary || 'Appliance issue reported',
    sentiment: (row.sentiment as CallSentiment) || 'Neutral',
    priority: (row.priority as CallPriority) || 'Medium',
    confidence: Number(row.ai_confidence) || 88,
    summary: row.summary || 'Customer called regarding appliance service inquiry.',
  };
}

// Map DbAction -> ActionItem
export function mapDbActionToActionItem(row: DbAction): ActionItem {
  return {
    id: row.id,
    action: (row.action_type as ActionItem['action']) || 'CHECK_CUSTOMER',
    description: row.description || 'Action processed by AI agent',
    completed: row.status === 'completed',
    timestamp: row.created_at
      ? new Date(row.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '00:00',
  };
}

// Map DbCall -> Call
export function mapDbCallToCall(
  row: DbCall,
  customer?: DbCustomer | null,
  analysis?: DbCallAnalysis | null,
  transcripts: DbTranscript[] = [],
  actions: DbAction[] = []
): Call {
  const isLive = row.status === 'in_progress';
  const durationSeconds = row.duration_seconds || 0;

  const domainAnalysis = mapDbCallAnalysisToAnalysis(analysis);

  let aiState: AIState = 'Completed';
  if (isLive) {
    aiState = analysis?.human_escalation ? 'Escalated' : 'Listening';
  } else if (analysis?.human_escalation) {
    aiState = 'Escalated';
  }

  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: customer?.name || 'Registered Customer',
    customerPhone: customer?.phone || row.phone_number || 'N/A',
    appliance: domainAnalysis.appliance,
    applianceId: analysis?.appliance_id || undefined,
    intent: domainAnalysis.intent,
    issue: domainAnalysis.issue,
    duration: formatDuration(durationSeconds),
    durationSeconds,
    sentiment: domainAnalysis.sentiment,
    outcome: (analysis?.outcome as CallOutcome) || (isLive ? 'Resolved by AI' : 'Service Request Created'),
    priority: domainAnalysis.priority,
    aiState,
    aiConfidence: domainAnalysis.confidence,
    date: row.started_at
      ? new Date(row.started_at).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recent',
    isLive,
    currentAction: isLive ? 'AI diagnosing issue and querying appliance warranty' : undefined,
    transcript: transcripts.map(mapDbTranscriptToMessage),
    analysis: domainAnalysis,
    actionsTaken: actions.map(mapDbActionToActionItem),
  };
}

// Map DbServiceRequest -> ServiceRequest
export function mapDbServiceRequestToServiceRequest(
  row: DbServiceRequest,
  customer?: DbCustomer | null,
  appliance?: DbAppliance | null,
  actions: DbAction[] = []
): ServiceRequest {
  const appType = normalizeApplianceType(appliance?.appliance_type || row.category);

  // Generate timeline events from actions or status
  const timeline: ServiceRequestTimelineEvent[] = [
    {
      id: 't-1',
      title: 'Service Request Created',
      description: row.ai_summary || 'Generated via AI inbound voice call analysis',
      timestamp: row.created_at ? new Date(row.created_at).toLocaleString('en-IN') : 'Recent',
      status: 'completed',
    },
  ];

  if (row.assigned_technician) {
    timeline.push({
      id: 't-2',
      title: 'Technician Assigned',
      description: `Assigned to ${row.assigned_technician}`,
      timestamp: 'Scheduled',
      status: row.status === 'Assigned' ? 'current' : 'completed',
    });
  }

  if (row.status === 'Technician Scheduled' || row.status === 'In Progress' || row.status === 'Resolved') {
    timeline.push({
      id: 't-3',
      title: 'Visit Scheduled',
      description: 'Customer confirmed morning time window',
      timestamp: 'Upcoming',
      status: row.status === 'Technician Scheduled' ? 'current' : 'completed',
    });
  }

  if (row.status === 'Resolved' || row.status === 'Closed') {
    timeline.push({
      id: 't-4',
      title: 'Issue Resolved',
      description: row.resolution_notes || 'Technician completed diagnostics and maintenance',
      timestamp: row.updated_at ? new Date(row.updated_at).toLocaleString('en-IN') : 'Completed',
      status: 'completed',
    });
  }

  return {
    id: row.request_number || row.id,
    callId: row.call_id || undefined,
    customerId: row.customer_id,
    customerName: customer?.name || 'Customer Profile',
    customerPhone: customer?.phone || 'N/A',
    customerAddress: customer?.city ? `${customer.city}, India` : 'India',
    appliance: appType,
    applianceId: row.appliance_id,
    brand: appliance?.brand || 'Brand Registered',
    model: appliance?.model || 'Unit',
    issue: row.issue || 'Appliance service requested',
    priority: (row.priority as CallPriority) || 'Medium',
    status: (row.status as ServiceRequest['status']) || 'New',
    assignedTechnician: row.assigned_technician || undefined,
    scheduledDate: 'Tomorrow, 10:00 AM - 01:00 PM',
    created: row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : 'Recent',
    createdAt: row.created_at || new Date().toISOString(),
    aiSummary: row.ai_summary || row.issue,
    recommendedAction: row.recommended_action || 'Dispatch technician for physical inspection',
    timeline,
  };
}

// Map DbKnowledgeDocument -> KnowledgeDocument
export function mapDbKnowledgeDocToDoc(row: DbKnowledgeDocument): KnowledgeDocument {
  return {
    id: row.id,
    title: row.title,
    category: (row.category as KnowledgeCategory) || 'Troubleshooting',
    status: (row.status as 'Published' | 'Draft' | 'Review Required') || 'Published',
    lastUpdated: row.last_updated_at
      ? new Date(row.last_updated_at).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Recent',
    author: 'HomeCare AI Engineering',
    readingTime: '3 min read',
    summary: row.description || row.title,
    content: row.content,
    tags: [row.category, row.appliance_type || 'General'].filter(Boolean) as string[],
  };
}

// Map DbAgentConfiguration -> AgentConfiguration
export function mapDbAgentConfigToConfig(
  row: DbAgentConfiguration | null | undefined
): AgentConfiguration {
  return {
    agentName: row?.agent_name || 'Aarav (HomeCare Voice)',
    greeting:
      row?.greeting ||
      'Welcome to HomeCare support. I am Aarav, your AI service assistant. How can I help you today?',
    language: row?.language || 'Indian English',
    tone: (row?.tone as AgentConfiguration['tone']) || 'Empathetic',
    maxConversationDurationMinutes: row?.max_conversation_minutes || 8,
    humanEscalationThreshold: 80,
    aiConfidenceThreshold: row?.ai_confidence_threshold || 80,
    supportedAppliances: [
      'Air Conditioner',
      'Washing Machine',
      'Refrigerator',
      'Television',
      'Water Purifier',
    ],
    escalationRules: [
      {
        id: 'r-1',
        title: 'Customer Expresses Extreme Frustration',
        condition: 'sentiment === Frustrated && frustrationCount >= 2',
        enabled: true,
        severity: 'High',
        actionTarget: 'Supervisor Support Queue',
      },
      {
        id: 'r-2',
        title: 'Gas Leak or Electrical Spark Hazard',
        condition: 'issueKeywords.includes("gas leak", "sparking", "short circuit")',
        enabled: true,
        severity: 'Critical',
        actionTarget: 'Emergency Dispatch & Immediate Transfer',
      },
      {
        id: 'r-3',
        title: 'Low AI Confidence Threshold',
        condition: 'confidenceScore < 65% for 3 consecutive turns',
        enabled: true,
        severity: 'Medium',
        actionTarget: 'Warm Transfer to Tier-1 Agent',
      },
    ],
  };
}
