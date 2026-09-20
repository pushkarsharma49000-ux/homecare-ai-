import { CallAnalysis, ApplianceType, CallIntent, CallSentiment, CallPriority } from '@/types';

/**
 * AI Inference, Intent Detection & Speech Understanding Service
 * 
 * Future Architecture:
 * Audio Stream -> Gemini Multimodal Live API -> Structured Tool & Function Call Schema
 * 
 * Phase 1: Pure interface definitions and placeholder types.
 * No fake API calls pretending to be real.
 */

export interface AIIntentExtractionResult {
  intent: CallIntent;
  confidence: number;
  extractedEntities: {
    applianceType?: ApplianceType;
    modelName?: string;
    serialNumber?: string;
    issueDescription?: string;
    urgencyIndicator?: CallPriority;
  };
  sentiment: CallSentiment;
  requiresClarification: boolean;
  suggestedFollowUpQuestion?: string;
}

export interface AIServiceStatus {
  isConfigured: boolean;
  activeModel: string;
  latencyAvgMs: number;
  confidenceThreshold: number;
}

export async function getAIServiceStatus(): Promise<AIServiceStatus> {
  return {
    isConfigured: false,
    activeModel: 'Gemini 1.5 Flash (Phase 2 Placeholder)',
    latencyAvgMs: 420,
    confidenceThreshold: 80,
  };
}
