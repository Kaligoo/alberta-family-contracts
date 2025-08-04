import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { familyContracts, users, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get test@test.com user info
    const [testUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'test@test.com'))
      .limit(1);

    if (!testUser) {
      return NextResponse.json({ error: 'test@test.com user not found' });
    }

    // Get test user's team info
    const [teamMember] = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, testUser.id))
      .limit(1);

    // Get all contracts for test user (regardless of teamId)
    const userContracts = await db
      .select({
        id: familyContracts.id,
        userFullName: familyContracts.userFullName,
        partnerFullName: familyContracts.partnerFullName,
        userId: familyContracts.userId,
        teamId: familyContracts.teamId,
        status: familyContracts.status,
        contractType: familyContracts.contractType,
        createdAt: familyContracts.createdAt,
        updatedAt: familyContracts.updatedAt,
      })
      .from(familyContracts)
      .where(eq(familyContracts.userId, testUser.id));

    // Get total contracts in database
    const allContracts = await db
      .select({ count: familyContracts.id })
      .from(familyContracts);

    return NextResponse.json({
      testUser: {
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
        teamId: teamMember?.teamId || null
      },
      userContracts: userContracts,
      userContractCount: userContracts.length,
      totalContractsInDatabase: allContracts.length,
      hasTeam: !!teamMember?.teamId,
      debug: {
        queryUsed: teamMember?.teamId ? 'userId + teamId filter' : 'userId only filter',
        teamIdFromMember: teamMember?.teamId,
        contractsWithNullTeamId: userContracts.filter(c => c.teamId === null).length,
        contractsWithTeamId: userContracts.filter(c => c.teamId !== null).length
      }
    });
  } catch (error) {
    console.error('Error debugging user contracts:', error);
    return NextResponse.json(
      { error: 'Failed to debug user contracts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}