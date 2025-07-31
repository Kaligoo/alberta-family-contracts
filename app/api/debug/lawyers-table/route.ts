import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { lawyers } from '@/lib/db/schema';

export async function GET() {
  try {
    // Try to query the lawyers table
    const lawyerCount = await db
      .select()
      .from(lawyers)
      .limit(1);

    return NextResponse.json({ 
      success: true, 
      message: 'Lawyers table exists and is accessible',
      sampleCount: lawyerCount.length
    });
  } catch (error) {
    console.error('Lawyers table error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'The lawyers table may not exist or there may be a database connection issue'
    }, { status: 500 });
  }
}