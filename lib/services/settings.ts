import { supabase } from '@/lib/supabase/client';
import { AgentConfiguration } from '@/types';
import { DbAgentConfiguration } from '@/types/supabase';
import { mapDbAgentConfigToConfig } from './adapters';

export async function getAgentConfiguration(): Promise<AgentConfiguration> {
  try {
    const { data, error } = await supabase
      .from('agent_configuration')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching agent configuration:', error.message);
      return mapDbAgentConfigToConfig(null);
    }

    return mapDbAgentConfigToConfig(data);
  } catch (err) {
    console.error('Unexpected error in getAgentConfiguration:', err);
    return mapDbAgentConfigToConfig(null);
  }
}

export async function updateAgentConfiguration(
  config: Partial<AgentConfiguration>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get existing config id if exists
    const { data: existing } = await supabase
      .from('agent_configuration')
      .select('id')
      .limit(1)
      .maybeSingle();

    const dbPayload: Partial<DbAgentConfiguration> = {
      updated_at: new Date().toISOString(),
    };

    if (config.agentName !== undefined) dbPayload.agent_name = config.agentName;
    if (config.greeting !== undefined) dbPayload.greeting = config.greeting;
    if (config.language !== undefined) dbPayload.language = config.language;
    if (config.tone !== undefined) dbPayload.tone = config.tone;
    if (config.maxConversationDurationMinutes !== undefined)
      dbPayload.max_conversation_minutes = config.maxConversationDurationMinutes;
    if (config.aiConfidenceThreshold !== undefined)
      dbPayload.ai_confidence_threshold = config.aiConfidenceThreshold;

    if (existing?.id) {
      const { error } = await supabase
        .from('agent_configuration')
        .update(dbPayload)
        .eq('id', existing.id);

      if (error) {
        console.error('Error updating agent configuration:', error.message);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase.from('agent_configuration').insert({
        id: '00000000-0000-0000-0000-000000000001',
        agent_name: config.agentName || 'Aarav (HomeCare Voice)',
        greeting:
          config.greeting ||
          'Welcome to HomeCare support. I am Aarav, your AI service assistant. How can I help you today?',
        language: config.language || 'Indian English',
        tone: config.tone || 'Empathetic',
        max_conversation_minutes: config.maxConversationDurationMinutes || 8,
        ai_confidence_threshold: config.aiConfidenceThreshold || 80,
        enabled: true,
        ...dbPayload,
      });

      if (error) {
        console.error('Error inserting agent configuration:', error.message);
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Unexpected error in updateAgentConfiguration:', message);
    return { success: false, error: message };
  }
}
