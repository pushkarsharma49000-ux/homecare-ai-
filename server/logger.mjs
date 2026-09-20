/**
 * HomeCare AI Voice Gateway — Structured Logger
 * 
 * Secure logging: masks secrets, never logs sensitive keys or raw binary buffers.
 */

const SENSITIVE_KEY_PATTERNS = [
  /key/i,
  /secret/i,
  /token/i,
  /auth/i,
  /password/i,
  /cookie/i,
];

function sanitize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) {
    return `<Binary Buffer: ${obj.length} bytes>`;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((p) => p.test(k));
    if (isSensitive && typeof v === 'string') {
      clean[k] = v.length > 8 ? `${v.substring(0, 4)}...[REDACTED]` : '[REDACTED]';
    } else {
      clean[k] = sanitize(v);
    }
  }
  return clean;
}

export function log(event, data = {}) {
  const timestamp = new Date().toISOString();
  const safeData = sanitize(data);
  const metadata = Object.keys(safeData).length > 0 ? ` ${JSON.stringify(safeData)}` : '';
  console.log(`[${timestamp}] [VOICE-GATEWAY] [${event}]${metadata}`);
}

export function logError(event, err, context = {}) {
  const timestamp = new Date().toISOString();
  const safeContext = sanitize(context);
  let message = '';
  if (err instanceof Error) {
    message = err.message;
  } else if (err && typeof err === 'object') {
    message = err.message || err.error_description || JSON.stringify(err);
  } else {
    message = String(err);
  }

  console.error(
    `[${timestamp}] [VOICE-GATEWAY] [${event}] ERROR: ${message}`,
    Object.keys(safeContext).length > 0 ? JSON.stringify(safeContext) : ''
  );
}

export default { log, logError };
