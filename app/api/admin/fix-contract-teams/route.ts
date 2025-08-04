import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { familyContracts, teams, teamMembers, users } from '@/lib/db/schema';
import { eq, isNull, sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing contract team assignments...');
    
    // First, find all users who don't have teams
    const usersWithoutTeams = await db
      .select({ 
        userId: users.id, 
        userEmail: users.email 
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(isNull(teamMembers.teamId));

    console.log('Users without teams:', usersWithoutTeams.length);

    // Create teams for users who don't have them
    for (const user of usersWithoutTeams) {
      // Create a team for this user
      const [newTeam] = await db
        .insert(teams)
        .values({
          name: `${user.userEmail}'s Team`,
        })
        .returning();

      console.log(`Created team ${newTeam.id} for user ${user.userId}`);

      // Add user to the team
      await db
        .insert(teamMembers)
        .values({
          userId: user.userId,
          teamId: newTeam.id,
          role: 'owner'
        });

      console.log(`Added user ${user.userId} to team ${newTeam.id}`);
    }

    // Now find all contracts with null teamId and assign them to their user's team
    const contractsWithoutTeams = await db
      .select({
        contractId: familyContracts.id,
        userId: familyContracts.userId,
        userEmail: users.email
      })
      .from(familyContracts)
      .leftJoin(users, eq(familyContracts.userId, users.id))
      .where(isNull(familyContracts.teamId));

    console.log('Contracts without teams:', contractsWithoutTeams.length);

    let fixedContracts = 0;
    for (const contract of contractsWithoutTeams) {
      // Find the user's team
      const [userTeam] = await db
        .select({ teamId: teamMembers.teamId })
        .from(teamMembers)
        .where(eq(teamMembers.userId, contract.userId))
        .limit(1);

      if (userTeam) {
        // Update the contract with the team ID
        await db
          .update(familyContracts)
          .set({ teamId: userTeam.teamId })
          .where(eq(familyContracts.id, contract.contractId));
        
        console.log(`Fixed contract ${contract.contractId} for user ${contract.userEmail}, assigned to team ${userTeam.teamId}`);
        fixedContracts++;
      }
    }

    // Get summary info
    const totalContracts = await db
      .select({ count: sql<number>`count(*)` })
      .from(familyContracts);

    const contractsWithNullTeam = await db
      .select({ count: sql<number>`count(*)` })
      .from(familyContracts)
      .where(isNull(familyContracts.teamId));

    console.log('✅ Contract team assignment fix completed');

    return NextResponse.json({
      success: true,
      message: 'Contract team assignments fixed',
      usersWithoutTeamsFound: usersWithoutTeams.length,
      contractsWithoutTeamsFound: contractsWithoutTeams.length,
      contractsFixed: fixedContracts,
      totalContracts: totalContracts[0].count,
      contractsStillWithoutTeam: contractsWithNullTeam[0].count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fixing contract teams:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fix contract teams', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}