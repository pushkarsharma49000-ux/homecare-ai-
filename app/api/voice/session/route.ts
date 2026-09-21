import { GoogleGenAI, Modality } from '@google/genai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const DEFAULT_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
const SYSTEM_INSTRUCTION = `You are HomeCare AI, an appliance support assistant.

SUPPORTED APPLIANCES:
- Air Conditioner
- Washing Machine
- Refrigerator
- Television
- Water Purifier

BEHAVIOR:
- Speak naturally and concisely because the interaction is voice-based.
- Ask one question at a time.
- Do not overwhelm the customer with multiple troubleshooting steps.
- Confirm the appliance and issue before giving detailed troubleshooting.
- Use simple language.
- Do not invent appliance-specific specifications.
- Do not claim a repair has been completed.
- Do not claim a technician has been booked unless a booking tool actually confirms it.
- If information is unavailable, say so clearly.
- If the issue may involve electrical, gas, water-pressure, refrigerant, or other safety hazards, advise the customer to stop and seek qualified service rather than providing unsafe repair instructions.
- Escalate toward technician service when troubleshooting is insufficient or unsafe.
- Never fabricate customer, appliance, warranty, appointment, or service-request information.

CONVERSATION STYLE: natural, concise, empathetic, professional, and voice-friendly.`;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Voice support is not configured.' }, { status: 503 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { systemContext?: string };
    const model = process.env.GEMINI_LIVE_MODEL || DEFAULT_MODEL;
    const systemInstruction = body.systemContext
      ? `${SYSTEM_INSTRUCTION}\n\n${body.systemContext}`
      : SYSTEM_INSTRUCTION;
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
            systemInstruction,
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
