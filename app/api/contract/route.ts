import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's current contract (most recent)
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(eq(familyContracts.userId, user.id))
      .orderBy(desc(familyContracts.updatedAt))
      .limit(1);

    return NextResponse.json({ contract: contract || null });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract data' },
      { status: 500 }
    );
  }
}