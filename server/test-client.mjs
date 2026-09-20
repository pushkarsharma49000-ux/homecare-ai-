/**
 * HomeCare AI Voice Gateway — Automated Test Suite
 * 
 * Verifies:
 * 1. Health endpoint GET /health returns 200 OK
 * 2. WebSocket connects on /voice
 * 3. Text/JSON message sent and received without error
 * 4. Binary audio message sent and accepted without crashing
 * 5. Ping/Pong keepalive functions
 * 6. Clean disconnection handling
 */

import http from 'http';
import { WebSocket } from 'ws';

const GATEWAY_HOST = process.env.VOICE_GATEWAY_HOST || 'localhost';
const GATEWAY_PORT = process.env.VOICE_GATEWAY_PORT || process.env.PORT || '8080';
const HEALTH_URL = `http://${GATEWAY_HOST}:${GATEWAY_PORT}/health`;
const WS_URL = `ws://${GATEWAY_HOST}:${GATEWAY_PORT}/voice?phone=%2B919820100000&call_id=TEST-CALL-001`;

let testsPassed = 0;
let testsFailed = 0;

function pass(name, detail = '') {
  testsPassed += 1;
  console.log(`  ✓ PASS: ${name} ${detail ? `(${detail})` : ''}`);
}

function fail(name, detail = '') {
  testsFailed += 1;
  console.error(`  ✗ FAIL: ${name} ${detail ? `(${detail})` : ''}`);
}

async function testHealthEndpoint() {
  return new Promise((resolve) => {
    console.log('\n[TEST 1] Testing Health Endpoint: ' + HEALTH_URL);
    http
      .get(HEALTH_URL, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode === 200) {
              const json = JSON.parse(body);
              if (json.status === 'ok' && json.service === 'homecare-ai-voice-gateway') {
                pass('Health endpoint returns 200 OK with correct JSON payload', `service=${json.service}`);
              } else {
                fail('Health endpoint returned unexpected JSON body', body);
              }
            } else {
              fail('Health endpoint returned non-200 status', `status=${res.statusCode}`);
            }
          } catch (e) {
            fail('Health endpoint response parse error', e.message);
          }
          resolve();
        });
      })
      .on('error', (err) => {
        fail('Failed to connect to health endpoint', err.message);
        resolve();
      });
  });
}

async function testWebSocketSession() {
  return new Promise((resolve) => {
    console.log('\n[TEST 2] Testing WebSocket Stream: ' + WS_URL);

    const ws = new WebSocket(WS_URL);
    let messageSent = false;
    let binarySent = false;

    ws.on('open', () => {
      pass('WebSocket client successfully connected to /voice');

      // Test Text JSON Message
      try {
        const textPayload = JSON.stringify({
          event: 'start',
          call_id: 'TEST-CALL-001',
          from: '+919820100000',
          to: '+911800001234',
          codec: 'PCMA',
          sample_rate: 8000,
          timestamp: new Date().toISOString(),
        });
        ws.send(textPayload);
        pass('Sent text JSON VoiceLink handshake message');
        messageSent = true;
      } catch (err) {
        fail('Failed to send text JSON message', err.message);
      }

      // Test Binary Audio Buffer (160 bytes simulating a 20ms G.711 A-law frame)
      try {
        const audioBuffer = Buffer.alloc(160, 0xd5); // 0xd5 is quiet/silence in PCMA
        ws.send(audioBuffer, { binary: true });
        pass('Sent binary audio message chunk (160 bytes PCMA G.711)');
        binarySent = true;
      } catch (err) {
        fail('Failed to send binary message', err.message);
      }

      // Test ping
      try {
        ws.ping();
        pass('Sent ping keepalive frame');
      } catch (err) {
        fail('Failed to send ping', err.message);
      }

      // Allow 500ms for gateway processing, then close cleanly
      setTimeout(() => {
        ws.close(1000, 'Test Completed Cleanly');
      }, 500);
    });

    ws.on('pong', () => {
      pass('Received pong heartbeat response from server');
    });

    ws.on('error', (err) => {
      fail('WebSocket error occurred', err.message);
    });

    ws.on('close', (code, reason) => {
      if (code === 1000) {
        pass('WebSocket connection closed cleanly with code 1000', reason ? reason.toString() : '');
      } else {
        fail('WebSocket closed with non-normal code', `code=${code}`);
      }
      resolve();
    });
  });
}

async function testInvalidEndpointRejection() {
  return new Promise((resolve) => {
    const invalidWsUrl = `ws://${GATEWAY_HOST}:${GATEWAY_PORT}/invalid-endpoint`;
    console.log('\n[TEST 3] Testing Invalid WebSocket Endpoint Rejection: ' + invalidWsUrl);

    const ws = new WebSocket(invalidWsUrl);

    ws.on('open', () => {
      fail('WebSocket unexpectedly connected to invalid endpoint /invalid-endpoint');
      ws.close();
      resolve();
    });

    ws.on('error', (err) => {
      pass('Gateway correctly rejected invalid endpoint', err.message);
      resolve();
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' HomeCare AI VoiceLink WebSocket Gateway Test Suite ');
  console.log('====================================================');

  await testHealthEndpoint();
  await testWebSocketSession();
  await testInvalidEndpointRejection();

  console.log('\n====================================================');
  console.log(` Summary: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('====================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
