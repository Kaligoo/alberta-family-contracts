import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    const { id } = await params;
    const contractId = parseInt(id);
    
    if (!userWithTeam?.teamId || !contractId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get specific contract for this user
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
      .limit(1);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    const { id } = await params;
    const contractId = parseInt(id);
    const body = await request.json();
    
    if (!userWithTeam?.teamId || !contractId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Update contract
    const [updatedContract] = await db
      .update(familyContracts)
      .set({
        userFullName: body.userFullName || null,
        partnerFullName: body.partnerFullName || null,
        userJobTitle: body.userJobTitle || null,
        partnerJobTitle: body.partnerJobTitle || null,
        userIncome: body.userIncome || null,
        partnerIncome: body.partnerIncome || null,
        children: body.children || [],
        status: body.status || 'draft',
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
      .returning();

    if (!updatedContract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ contract: updatedContract });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    const { id } = await params;
    const contractId = parseInt(id);
    
    if (!userWithTeam?.teamId || !contractId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Delete contract
    const deletedContract = await db
      .delete(familyContracts)
      .where(
        and(
          eq(familyContracts.id, contractId),
          eq(familyContracts.userId, user.id),
          eq(familyContracts.teamId, userWithTeam.teamId)
        )
      )
      .returning();

    if (deletedContract.length === 0) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
}