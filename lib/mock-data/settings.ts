import { AgentConfiguration, EscalationRule } from '@/types';

export const mockEscalationRules: EscalationRule[] = [
  {
    id: 'rule-1',
    title: 'Customer requests human agent',
    condition: 'Customer explicitly mentions agent, supervisor, manager, or representative',
    enabled: true,
    severity: 'High',
    actionTarget: 'Queue: Tier-2 Operations Specialist',
  },
  {
    id: 'rule-2',
    title: 'AI confidence below threshold',
    condition: 'AI Intent confidence falls below 80% across 2 consecutive conversational turns',
    enabled: true,
    severity: 'Medium',
    actionTarget: 'Queue: Technical Support Helpdesk',
  },
  {
    id: 'rule-3',
    title: 'Sensitive issue detected',
    condition: 'Customer reports refund disputes, legal notice, consumer court, or severe damage',
    enabled: true,
    severity: 'Critical',
    actionTarget: 'Queue: Customer Grievance Cell',
  },
  {
    id: 'rule-4',
    title: 'Repeated unsuccessful troubleshooting',
    condition: 'Customer called more than twice for the same appliance within the past 14 days',
    enabled: true,
    severity: 'High',
    actionTarget: 'Queue: Senior Escalation Team',
  },
  {
    id: 'rule-5',
    title: 'Customer frustration is high',
    condition: 'Acoustic emotion or sentiment analyzer detects sustained frustration or angry tone',
    enabled: true,
    severity: 'High',
    actionTarget: 'Queue: Priority Support Specialist',
  },
  {
    id: 'rule-6',
    title: 'Critical appliance issue detected',
    condition: 'Keywords indicating fire, sparking, burning smell, gas odor, or flooding water',
    enabled: true,
    severity: 'Critical',
    actionTarget: 'Queue: Emergency Field Dispatch Unit',
  },
];

export const mockAgentConfiguration: AgentConfiguration = {
  agentName: 'Aarav (HomeCare Voice)',
  greeting: 'Welcome to HomeCare support. I am Aarav, your AI service assistant. How can I help you with your home appliance today?',
  language: 'Indian English (with Hindi support)',
  tone: 'Empathetic',
  maxConversationDurationMinutes: 8,
  humanEscalationThreshold: 80,
  aiConfidenceThreshold: 80,
  supportedAppliances: [
    'Air Conditioner',
    'Washing Machine',
    'Refrigerator',
    'Television',
    'Water Purifier',
  ],
  escalationRules: mockEscalationRules,
};

export const mockCompanyProfile = {
  companyName: 'HomeCare Appliances Ltd.',
  brandTagline: 'AI-powered customer support for home appliances',
  supportEmail: 'support@homecare.example.in',
  inboundHelpline: '+91 1800 209 8899 (Toll Free)',
  operatingHours: '24 Hours / 7 Days a week',
  primaryOffice: 'B-Wing, Mindspace Tech Park, Airoli, Navi Mumbai 400708',
  serviceNetworkCities: '42 Cities across India',
  activeContractTier: 'Enterprise Growth Tier',
};

export const mockIntegrations = [
  {
    id: 'voicelink',
    name: 'VoiceLink Telephony',
    category: 'Inbound SIP & PSTN',
    description: 'Cloud telephony trunking and low-latency bidirectional WebRTC voice streaming for +91 Indian inbound support numbers.',
    status: 'Not Connected',
    badgeText: 'Phase 2 Ready',
    icon: 'PhoneCall',
  },
  {
    id: 'supabase',
    name: 'Supabase Database',
    category: 'PostgreSQL & Realtime',
    description: 'Relational data store for customer profiles, appliance registries, service requests, and live call analytics with RLS security.',
    status: 'Not Connected',
    badgeText: 'Phase 2 Ready',
    icon: 'Database',
  },
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    category: 'Multimodal LLM & Speech',
    description: 'Ultra-low latency speech understanding, real-time intent extraction, structured JSON action generation, and diagnostic logic.',
    status: 'Not Connected',
    badgeText: 'Phase 2 Ready',
    icon: 'Sparkles',
  },
];
