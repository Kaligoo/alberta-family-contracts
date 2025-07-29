import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    
    if (!userWithTeam?.teamId) {
      return NextResponse.json({ contract: null });
    }

    // Get the user's current contract (for now, just get the most recent since column may not exist yet)
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
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