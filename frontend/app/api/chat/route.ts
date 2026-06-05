import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const FALLBACK_REPLY = 'Sorry, try again.';
const SYSTEM_PROMPT = 'You are an expert Egyptian tourism assistant for Egypt Panorama website. Help users discover tourism in Egypt. Answer in the same language the user writes in (Arabic or English). Keep answers concise.';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

type ChatMessage = {
  from?: string;
  text?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message ?? '';
    const history = Array.isArray(body?.history) ? (body.history as ChatMessage[]) : [];

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      console.error('GROQ_API_KEY is missing. Add it to frontend/.env.local and restart the dev server.');
      return NextResponse.json({ reply: FALLBACK_REPLY, warning: 'GROQ_API_KEY is missing' }, { status: 200 });
    }

    const client = new OpenAI({ apiKey, baseURL: GROQ_BASE_URL });

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...history
        .filter((item) => typeof item?.text === 'string')
        .map((item) => ({
          role: item.from === 'user' ? ('user' as const) : ('assistant' as const),
          content: item.text as string,
        })),
      { role: 'user' as const, content: message },
    ];

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '';
    if (!reply) {
      console.error('Groq response did not include a text reply:', completion);
      return NextResponse.json({ reply: FALLBACK_REPLY, warning: 'Groq response did not include a text reply' }, { status: 200 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Groq call failed:', err);
    return NextResponse.json({ reply: FALLBACK_REPLY, warning: 'Groq call failed' }, { status: 200 });
  }
}
