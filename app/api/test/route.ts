import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    stripe_configured: !!process.env.STRIPE_SECRET_KEY
  });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'POST endpoint working!', 
    timestamp: new Date().toISOString(),
    stripe_configured: !!process.env.STRIPE_SECRET_KEY
  });
}