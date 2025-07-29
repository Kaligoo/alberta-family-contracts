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
      return NextResponse.json({ contracts: [] });
    }

    // Get all contracts for this user
    console.log('Fetching contracts for user:', user.id, 'team:', userWithTeam.teamId);
    
    const contracts = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
      .orderBy(desc(familyContracts.updatedAt));

    console.log('Found contracts:', contracts.length);
    
    return NextResponse.json({ contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    
    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: 'User is not part of a team' }, { status: 400 });
    }

    const body = await request.json();
    
    // Create new contract
    const [newContract] = await db
      .insert(familyContracts)
      .values({
        userId: user.id,
        teamId: userWithTeam.teamId,
        userFullName: body.userFullName || null,
        partnerFullName: body.partnerFullName || null,
        userFirstName: body.userFirstName || null,
        partnerFirstName: body.partnerFirstName || null,
        userPronouns: body.userPronouns || null,
        partnerPronouns: body.partnerPronouns || null,
        userAge: body.userAge ? parseInt(body.userAge) : null,
        partnerAge: body.partnerAge ? parseInt(body.partnerAge) : null,
        cohabDate: body.cohabDate && body.cohabDate !== '' ? (() => {
          const date = new Date(body.cohabDate);
          return isNaN(date.getTime()) ? null : date;
        })() : null,
        proposedMarriageDate: body.proposedMarriageDate && body.proposedMarriageDate !== '' ? (() => {
          const date = new Date(body.proposedMarriageDate);
          return isNaN(date.getTime()) ? null : date;
        })() : null,
        userJobTitle: body.userJobTitle || null,
        partnerJobTitle: body.partnerJobTitle || null,
        userIncome: body.userIncome || null,
        partnerIncome: body.partnerIncome || null,
        children: body.children || [],
        status: 'draft',
        contractType: 'cohabitation',
      })
      .returning();

    return NextResponse.json({ contract: newContract });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}