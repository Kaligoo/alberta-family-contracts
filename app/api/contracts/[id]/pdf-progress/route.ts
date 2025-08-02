import { NextRequest, NextResponse } from 'next/server';
import { getPdfProgress } from '@/lib/utils/pdf-progress';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contractId = parseInt(id);
    
    if (isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    const progressData = getPdfProgress(contractId);
    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error getting PDF progress:', error);
    return NextResponse.json(
      { error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}