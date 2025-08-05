import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: 'Teams have been removed from the system. Contracts are now directly associated with users.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in fix-contract-teams endpoint:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}