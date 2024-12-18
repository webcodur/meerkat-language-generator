import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  });
} 