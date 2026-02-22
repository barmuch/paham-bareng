import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 20;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const requests = rateLimit.get(ip).filter((time: number) => now - time < windowMs);
  
  if (requests.length >= maxRequests) {
    return false;
  }

  requests.push(now);
  rateLimit.set(ip, requests);
  return true;
}

async function callOpenAI(messages: any[], maxTokens = 1000) {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key') {
    return {
      content: 'AI features require a valid OpenAI API key. Please configure OPENAI_API_KEY in your .env file.',
    };
  }

  const { OpenAI } = require('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  return response.choices[0].message;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many AI requests, please try again later' },
        { status: 429 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { action, message, context, topic, description } = body;

    // Handle generate-roadmap action
    if (action === 'generate-roadmap') {
      const messages = [
        {
          role: 'system',
          content: `You are a learning roadmap expert. Generate a structured learning roadmap as JSON.
          Return ONLY valid JSON with this structure:
          {
            "title": "string",
            "description": "string",
            "nodes": [{ "id": "string", "label": "string", "description": "string", "type": "topic|subtopic|skill|milestone", "position": {"x": number, "y": number}, "estimatedHours": number, "resources": [{"title": "string", "url": "string", "type": "article|video|course"}] }],
            "edges": [{ "id": "string", "source": "string", "target": "string" }],
            "tags": ["string"],
            "estimatedHours": number
          }`,
        },
        {
          role: 'user',
          content: `Create a comprehensive learning roadmap for: ${topic}. ${description || ''} Include 8-15 nodes with proper connections and resources.`,
        },
      ];

      const response = await callOpenAI(messages, 2000);

      let roadmapData;
      try {
        roadmapData = JSON.parse(response.content);
      } catch {
        roadmapData = { raw: response.content };
      }

      return NextResponse.json({ success: true, data: roadmapData });
    }

    // Default: handle chat action
    const messages = [
      {
        role: 'system',
        content: `You are a helpful AI learning companion for a developer learning platform similar to roadmap.sh.
        Help users with their questions about programming, technology, career paths, and learning strategies.
        Be concise but informative. ${context ? `Context: The user is currently studying ${context}.` : ''}`,
      },
      { role: 'user', content: message },
    ];

    const response = await callOpenAI(messages);
    return NextResponse.json({ success: true, data: { message: response.content } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
