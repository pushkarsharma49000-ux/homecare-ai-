export type ApplianceType =
  | 'Air Conditioner'
  | 'Washing Machine'
  | 'Refrigerator'
  | 'Television'
  | 'Water Purifier';

export type ApplianceStatus =
  | 'Active'
  | 'Under Service'
  | 'Inactive'
  | 'Warranty Expired';

export type WarrantyStatus = 'Active' | 'Expired' | 'Expiring Soon';

export interface Appliance {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: ApplianceType;
  brand: string;
  model: string;
  serialNumber: string;
  capacity?: string;
  purchaseDate: string;
  warranty: WarrantyStatus;
  warrantyExpiryDate: string;
  lastService: string;
  status: ApplianceStatus;
  notes?: string;
}

export type CustomerStatus = 'Active' | 'VIP' | 'Inactive';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  status: CustomerStatus;
  customerSince: string;
  activeAppliancesCount: number;
  openRequestsCount: number;
  lastContact: string;
  appliances?: Appliance[];
}

export type CallSentiment = 'Positive' | 'Neutral' | 'Frustrated';

export type CallOutcome =
  | 'Resolved by AI'
  | 'Service Request Created'
  | 'Human Escalation'
  | 'Callback Required';

export type CallIntent =
  | 'Product Issue'
  | 'Order Status'
  | 'Installation'
  | 'Warranty'
  | 'Refund'
  | 'Human Agent';

export type CallPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type AIState = 'Listening' | 'Thinking' | 'Taking Action' | 'Completed' | 'Escalated';

export interface TranscriptMessage {
  id: string;
  speaker: 'ai' | 'customer';
  message: string;
  timestamp: string;
  confidence?: number;
}

export interface CallAnalysis {
  intent: CallIntent;
  appliance: ApplianceType;
  issue: string;
  sentiment: CallSentiment;
  priority: CallPriority;
  confidence: number;
  summary: string;
}

export interface ActionItem {
  id: string;
  action:
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
  description: string;
  completed: boolean;
  timestamp: string;
}

export interface Call {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  appliance: ApplianceType;
  applianceId?: string;
  intent: CallIntent;
  issue: string;
  duration: string; // e.g. "02:41"
  durationSeconds: number;
  sentiment: CallSentiment;
  outcome: CallOutcome;
  priority: CallPriority;
  aiState: AIState;
  aiConfidence: number; // e.g. 94
  date: string;
  isLive?: boolean;
  currentAction?: string;
  transcript: TranscriptMessage[];
  analysis: CallAnalysis;
  actionsTaken: ActionItem[];
}

export type ServiceRequestStatus =
  | 'New'
  | 'Assigned'
  | 'Technician Scheduled'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export interface ServiceRequestTimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
}

export interface ServiceRequest {
  id: string;
  callId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  appliance: ApplianceType;
  applianceId: string;
  brand: string;
  model: string;
  issue: string;
  priority: CallPriority;
  status: ServiceRequestStatus;
  assignedTechnician?: string;
  scheduledDate?: string;
  created: string;
  createdAt: string;
  aiSummary: string;
  recommendedAction: string;
  timeline: ServiceRequestTimelineEvent[];
}

export type KnowledgeCategory =
  | 'Air Conditioner'
  | 'Washing Machine'
  | 'Refrigerator'
  | 'Television'
  | 'Water Purifier'
  | 'Warranty'
  | 'Installation'
  | 'Troubleshooting';

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: KnowledgeCategory;
  status: 'Published' | 'Draft' | 'Review Required';
  lastUpdated: string;
  author: string;
  readingTime: string;
  summary: string;
  content: string;
  tags: string[];
}

export interface EscalationRule {
  id: string;
  title: string;
  condition: string;
  enabled: boolean;
  severity: CallPriority;
  actionTarget: string;
}

export interface AgentConfiguration {
  agentName: string;
  greeting: string;
  language: string;
  tone: 'Professional' | 'Empathetic' | 'Direct' | 'Friendly';
  maxConversationDurationMinutes: number;
  humanEscalationThreshold: number; // percentage, e.g. 80
  aiConfidenceThreshold: number; // percentage, e.g. 80
  supportedAppliances: ApplianceType[];
  escalationRules: EscalationRule[];
}

export interface DashboardKPIs {
  totalCalls: number;
  totalCallsSubtitle: string;
  aiResolutionRate: number;
  aiResolutionRateSubtitle: string;
  serviceRequestsCount: number;
  serviceRequestsSubtitle: string;
  humanEscalationsCount: number;
  humanEscalationsSubtitle: string;
  avgCallDuration: string;
  avgCallDurationSubtitle: string;
}

export interface AIPerformanceMetrics {
  intentAccuracy: number;
  actionSuccessRate: number;
  averageAIConfidence: number;
  humanEscalationRate: number;
  averageResolutionTime: string;
}
