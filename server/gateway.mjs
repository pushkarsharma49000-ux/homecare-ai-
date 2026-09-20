/**
 * HomeCare AI — VoiceLink WebSocket Gateway
 * 
 * Persistent WebSocket server for real inbound telephony streaming.
 * Routes:
 *   - GET  /health   -> Health check endpoint
 *   - WS   /voice    -> Persistent VoiceLink audio/control stream
 */

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import crypto from 'crypto';
import { log, logError } from './logger.mjs';
import { createCallRecord, completeCallRecord } from './supabase.mjs';

const PORT = parseInt(process.env.VOICE_GATEWAY_PORT || process.env.PORT || '8080', 10);
const HOST = process.env.VOICE_GATEWAY_HOST || '0.0.0.0';
const KEEPALIVE_INTERVAL_MS = 30000;

// Track active sessions
const activeSessions = new Map();

// 1. Create HTTP Server
const server = http.createServer((req, res) => {
  const startTime = Date.now();
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const remoteIp = req.socket.remoteAddress || 'unknown';

  // [DIAGNOSTIC LOG] Incoming HTTP request with path, query, headers, and client IP
  log('HTTP-REQUEST-IN', {
    method: req.method,
    path: parsedUrl.pathname,
    query: Object.fromEntries(parsedUrl.searchParams.entries()),
    remoteIp,
    headers: req.headers,
  });

  req.on('error', (err) => {
    logError('HTTP-REQUEST-ERROR', err, {
      method: req.method,
      path: parsedUrl.pathname,
      remoteIp,
    });
  });

  res.on('finish', () => {
    log('HTTP-REQUEST-DONE', {
      method: req.method,
      path: parsedUrl.pathname,
      statusCode: res.statusCode,
      durationMs: Date.now() - startTime,
    });
  });

  // Set CORS headers for API consumers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint
  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        service: 'homecare-ai-voice-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        activeConnections: activeSessions.size,
        port: PORT,
      })
    );
    return;
  }

  // Root endpoint info
  if (parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        name: 'HomeCare AI Voice Gateway',
        description: 'Persistent inbound telephony WebSocket service for VoiceLink',
        version: '1.0.0',
        status: 'active',
        endpoints: {
          health: 'GET /health',
          voice: 'WS /voice',
        },
      })
    );
    return;
  }

  // Fallback 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found', path: parsedUrl.pathname }));
});

// 2. Create WebSocket Server attached to HTTP Server
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const parsedUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const remoteIp = request.socket.remoteAddress || 'unknown';

  // [DIAGNOSTIC LOG] Every WebSocket connection attempt with path, query, headers, and client IP
  log('WS-CONNECT-ATTEMPT', {
    method: request.method,
    path: parsedUrl.pathname,
    query: Object.fromEntries(parsedUrl.searchParams.entries()),
    remoteIp,
    headers: request.headers,
  });

  socket.on('error', (err) => {
    logError('WS-UPGRADE-SOCKET-ERROR', err, {
      path: parsedUrl.pathname,
      remoteIp,
    });
  });

  // Only allow WebSocket connections on /voice
  if (parsedUrl.pathname === '/voice' || parsedUrl.pathname === '/voice/') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    log('WS-REJECTED', {
      path: parsedUrl.pathname,
      reason: 'Invalid endpoint. Must connect to /voice',
      remoteIp,
      headers: request.headers,
    });
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
  }
});

// 3. Handle WebSocket Connections
wss.on('connection', async (ws, request) => {
  const sessionId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  const parsedUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  // Extract initial parameters from query string or headers
  const queryParams = Object.fromEntries(parsedUrl.searchParams.entries());
  const remoteIp = request.socket.remoteAddress || 'unknown';
  const userAgent = request.headers['user-agent'] || 'unknown';

  const voiceCallId =
    queryParams.call_id ||
    queryParams.call_sid ||
    queryParams.voice_call_id ||
    request.headers['x-voicelink-call-id'] ||
    `VL-${Date.now()}-${sessionId.substring(0, 6)}`;

  const phoneNumber =
    queryParams.phone ||
    queryParams.phone_number ||
    queryParams.from ||
    queryParams.caller ||
    request.headers['x-voicelink-caller'] ||
    null;

  const session = {
    id: sessionId,
    voiceCallId,
    phoneNumber,
    startedAt,
    startedAtMs: Date.now(),
    remoteIp,
    userAgent,
    isAlive: true,
    messageCount: 0,
    binaryMessageCount: 0,
    textMessageCount: 0,
    totalBytesReceived: 0,
  };

  activeSessions.set(sessionId, session);

  log('CONN-OPEN', {
    sessionId,
    path: parsedUrl.pathname,
    query: queryParams,
    voiceCallId,
    phoneNumber: phoneNumber ? `${phoneNumber.substring(0, 6)}XXXX` : 'unspecified',
    remoteIp,
    userAgent,
    headers: request.headers,
    activeConnections: activeSessions.size,
  });

  // Create initial call record in Supabase
  createCallRecord({
    id: sessionId,
    voiceCallId,
    phoneNumber,
    startedAt,
  }).catch((err) => {
    logError('DB-ASYNC-CREATE-FAIL', err, { sessionId });
  });

  // Setup Heartbeat / Keepalive
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
    session.isAlive = true;
  });

  // Handle Incoming Messages
  ws.on('message', (data, isBinary) => {
    session.messageCount += 1;
    const dataSize = data.length || 0;
    session.totalBytesReceived += dataSize;

    if (isBinary) {
      session.binaryMessageCount += 1;
      // Audio stream chunk (e.g. PCMA G.711 / PCM 16-bit)
      // Never log raw binary audio payload
      log('MSG-BINARY', {
        sessionId,
        chunkNumber: session.binaryMessageCount,
        byteLength: dataSize,
      });
      return;
    }

    // Text / JSON message
    session.textMessageCount += 1;
    const text = data.toString('utf8');

    try {
      const json = JSON.parse(text);
      const eventType = json.event || json.type || json.action || 'json_payload';
      const keys = Object.keys(json);

      log('MSG-JSON', {
        sessionId,
        eventType,
        keys,
        payloadSize: dataSize,
      });

      // Update call session context if VoiceLink sends start/call metadata
      if (json.event === 'start' || json.event === 'connected') {
        if (json.call_id && !session.voiceCallId.startsWith('VL-custom')) {
          session.voiceCallId = json.call_id;
        }
        if (json.from && !session.phoneNumber) {
          session.phoneNumber = json.from;
        }
      }
    } catch {
      // Non-JSON plain text message
      log('MSG-TEXT', {
        sessionId,
        textSnippet: text.substring(0, 80),
        byteLength: dataSize,
      });
    }
  });

  // Handle Socket Errors
  ws.on('error', (err) => {
    logError('WS-SOCKET-ERROR', err, {
      sessionId,
      path: parsedUrl.pathname,
      voiceCallId: session.voiceCallId,
      remoteIp,
    });
  });

  // Handle Socket Close
  ws.on('close', (code, reasonBuffer) => {
    const durationSeconds = (Date.now() - session.startedAtMs) / 1000;
    const reason = reasonBuffer ? reasonBuffer.toString('utf8') : '';

    activeSessions.delete(sessionId);

    log('CONN-CLOSE', {
      sessionId,
      path: parsedUrl.pathname,
      voiceCallId: session.voiceCallId,
      code,
      reason: reason || 'Normal Closure',
      durationSeconds: Math.round(durationSeconds),
      totalMessages: session.messageCount,
      binaryChunks: session.binaryMessageCount,
      totalBytes: session.totalBytesReceived,
      activeConnections: activeSessions.size,
    });

    // Update Supabase call record as completed
    completeCallRecord({
      id: sessionId,
      endedAt: new Date().toISOString(),
      durationSeconds,
    }).catch((err) => {
      logError('DB-ASYNC-UPDATE-FAIL', err, { sessionId });
    });
  });
});

// 4. Periodic Keepalive Interval
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      log('WS-TIMEOUT-TERMINATE', { reason: 'Client missed pong heartbeat' });
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, KEEPALIVE_INTERVAL_MS);

wss.on('close', () => {
  clearInterval(pingInterval);
});

// Server-level Error Handling
server.on('error', (err) => {
  logError('HTTP-SERVER-ERROR', err, { port: PORT, host: HOST });
});

wss.on('error', (err) => {
  logError('WSS-SERVER-ERROR', err);
});

// 5. Start Listening
server.listen(PORT, HOST, () => {
  log('GATEWAY-STARTED', {
    host: HOST,
    port: PORT,
    endpoints: {
      health: `http://${HOST}:${PORT}/health`,
      voiceLocalWs: `ws://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/voice`,
      voicePublicWss: `wss://<YOUR_DEPLOYED_DOMAIN>/voice`,
    },
  });
});

// Graceful Shutdown
function handleShutdown(signal) {
  log('GATEWAY-SHUTDOWN-SIGNAL', { signal });
  clearInterval(pingInterval);

  wss.clients.forEach((client) => {
    client.close(1001, 'Gateway Server Shutting Down');
  });

  server.close(() => {
    log('GATEWAY-STOPPED');
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

export { server, wss, activeSessions };
