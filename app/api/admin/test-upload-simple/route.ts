import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test basic functionality
    let pizzipTest = false;
    let pizzipError = '';
    
    try {
      const PizZip = require('pizzip');
      pizzipTest = true;
    } catch (error) {
      pizzipError = error instanceof Error ? error.message : 'Unknown pizzip error';
    }

    return NextResponse.json({
      message: 'Upload system test',
      user: user.email,
      pizzipAvailable: pizzipTest,
      pizzipError: pizzipError || 'None',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in upload test:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test upload system', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}