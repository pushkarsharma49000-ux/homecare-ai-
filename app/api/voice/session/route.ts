import { GoogleGenAI, Modality } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
const SYSTEM_INSTRUCTION =
  'You are the AI support assistant for a home-appliance service platform. Help customers troubleshoot their appliance issues clearly and conversationally. Do not invent appliance-specific facts when you do not have supporting information. Keep responses concise and natural for voice conversation.';

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Voice support is not configured.' }, { status: 503 });
  }

  try {
    const model = process.env.GEMINI_LIVE_MODEL || DEFAULT_MODEL;
    const ai = new GoogleGenAI({ apiKey });
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        newSessionExpireTime: new Date(Date.now() + 60_000).toISOString(),
        expireTime: new Date(Date.now() + 30 * 60_000).toISOString(),
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        },
        lockAdditionalFields: ['responseModalities', 'systemInstruction'],
      },
    });

    if (!token.name) throw new Error('Token creation returned no session token.');
    console.info('[voice-session] session token created');
    return NextResponse.json({ token: token.name, model });
  } catch {
    console.error('[voice-session] session token creation failed');
    return NextResponse.json({ error: 'Voice support could not be started.' }, { status: 502 });
  }
}
