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

    // Get the user's current contract (marked as current, or most recent if none marked)
    let [contract] = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId),
          eq(familyContracts.isCurrentContract, 'true')
        )
      )
      .limit(1);

    // If no current contract is set, get the most recent one
    if (!contract) {
      [contract] = await db
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
    }

    return NextResponse.json({ contract: contract || null });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract data' },
      { status: 500 }
    );
  }
}