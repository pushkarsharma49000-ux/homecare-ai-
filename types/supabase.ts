export interface DbCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export interface DbAppliance {
  id: string;
  customer_id: string;
  appliance_type: string;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string;
  warranty_start_date: string;
  warranty_end_date: string;
  status: string;
  last_service_date: string;
  created_at: string;
  updated_at?: string;
}

export interface DbCall {
  id: string;
  customer_id: string;
  voice_call_id: string;
  phone_number: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  status: string; // 'in_progress' | 'completed' | 'failed'
  recording_url: string | null;
  created_at: string;
}

export interface DbTranscript {
  id: string;
  call_id: string;
  speaker: 'ai' | 'customer' | 'agent';
  text: string;
  timestamp_seconds: number;
  created_at: string;
}

export interface DbCallAnalysis {
  id: string;
  call_id: string;
  appliance_id: string | null;
  intent: string;
  category: string;
  issue: string;
  sentiment: string;
  priority: string;
  outcome: string;
  summary: string;
  ai_confidence: number;
  follow_up_required: boolean;
  human_escalation: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DbServiceRequest {
  id: string;
  request_number: string;
  customer_id: string;
  appliance_id: string;
  call_id: string | null;
  issue: string;
  category: string;
  priority: string;
  status: string;
  recommended_action: string | null;
  assigned_technician: string | null;
  ai_summary: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DbAction {
  id: string;
  call_id: string | null;
  customer_id: string | null;
  service_request_id: string | null;
  action_type: string;
  description: string;
  status: string;
  input_data?: Record<string, unknown> | null;
  output_data?: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export interface DbKnowledgeDocument {
  id: string;
  title: string;
  category: string;
  appliance_type: string | null;
  description: string | null;
  content: string;
  source_url: string | null;
  status: string;
  last_updated_at: string;
  created_at: string;
}

export interface DbAgentConfiguration {
  id: string;
  agent_name: string;
  greeting: string;
  language: string;
  tone: string;
  max_conversation_minutes: number;
  ai_confidence_threshold: number;
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}
