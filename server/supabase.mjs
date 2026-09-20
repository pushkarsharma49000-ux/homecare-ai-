/**
 * HomeCare AI Voice Gateway — Supabase Database Interface
 * 
 * Handles recording inbound calls into public.calls.
 * Uses environment variables securely without leaking credentials.
 */

import { createClient } from '@supabase/supabase-js';
import { log, logError } from './logger.mjs';

const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');

// Prioritize service-role key for backend operations (to satisfy RLS), fallback to anon key
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    log('SUPABASE-INIT', {
      connected: true,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  } catch (err) {
    logError('SUPABASE-INIT-FAILED', err);
  }
} else {
  log('SUPABASE-INIT-SKIPPED', {
    reason: 'Missing SUPABASE_URL or SUPABASE_KEY in environment',
  });
}

/**
 * Creates a call record when an inbound voice WebSocket opens
 */
export async function createCallRecord({
  id,
  voiceCallId,
  phoneNumber,
  startedAt,
  customerId = null,
}) {
  if (!supabase) {
    log('DB-CALL-SKIPPED', { reason: 'Supabase client not initialized' });
    return { success: false, reason: 'uninitialized' };
  }

  try {
    let resolvedCustomerId = customerId;

    // If phone number is available and customerId is not, check if customer exists
    if (!resolvedCustomerId && phoneNumber) {
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phoneNumber)
        .maybeSingle();

      if (customer?.id) {
        resolvedCustomerId = customer.id;
        log('DB-CUSTOMER-MATCHED', { phoneNumber, customerId: resolvedCustomerId });
      }
    }

    const payload = {
      id,
      voice_call_id: voiceCallId || `VL-${Date.now()}`,
      phone_number: phoneNumber || null,
      customer_id: resolvedCustomerId,
      status: 'in_progress',
      started_at: startedAt || new Date().toISOString(),
      duration_seconds: 0,
    };

    const { data, error } = await supabase.from('calls').insert(payload).select().maybeSingle();

    if (error) {
      logError('DB-CALL-INSERT-NOTICE', error, {
        callId: id,
        voiceCallId,
        note: !process.env.SUPABASE_SERVICE_ROLE_KEY
          ? 'Provide SUPABASE_SERVICE_ROLE_KEY for direct backend database persistence'
          : undefined,
      });
      return { success: false, error: error.message };
    }

    log('DB-CALL-CREATED', { id, voiceCallId, status: 'in_progress' });
    return { success: true, data };
  } catch (err) {
    logError('DB-CALL-INSERT-EXCEPTION', err, { callId: id });
    return { success: false, error: String(err) };
  }
}

/**
 * Updates call status and duration when the WebSocket connection terminates
 */
export async function completeCallRecord({ id, endedAt, durationSeconds }) {
  if (!supabase) return { success: false, reason: 'uninitialized' };

  try {
    const payload = {
      status: 'completed',
      ended_at: endedAt || new Date().toISOString(),
      duration_seconds: Math.max(0, Math.round(durationSeconds || 0)),
    };

    const { data, error } = await supabase
      .from('calls')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      logError('DB-CALL-UPDATE-NOTICE', error, { callId: id });
      return { success: false, error: error.message };
    }

    log('DB-CALL-COMPLETED', { id, durationSeconds: payload.duration_seconds, status: 'completed' });
    return { success: true, data };
  } catch (err) {
    logError('DB-CALL-UPDATE-EXCEPTION', err, { callId: id });
    return { success: false, error: String(err) };
  }
}

export default { createCallRecord, completeCallRecord };
