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

    // Update contract - only update fields that are provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are present in the request body
    if (body.userFullName !== undefined) updateData.userFullName = body.userFullName || null;
    if (body.partnerFullName !== undefined) updateData.partnerFullName = body.partnerFullName || null;
    if (body.userFirstName !== undefined) updateData.userFirstName = body.userFirstName || null;
    if (body.partnerFirstName !== undefined) updateData.partnerFirstName = body.partnerFirstName || null;
    if (body.userAge !== undefined) updateData.userAge = body.userAge ? parseInt(body.userAge) : null;
    if (body.partnerAge !== undefined) updateData.partnerAge = body.partnerAge ? parseInt(body.partnerAge) : null;
    if (body.cohabDate !== undefined) updateData.cohabDate = body.cohabDate ? new Date(body.cohabDate) : null;
    if (body.userJobTitle !== undefined) updateData.userJobTitle = body.userJobTitle || null;
    if (body.partnerJobTitle !== undefined) updateData.partnerJobTitle = body.partnerJobTitle || null;
    if (body.userIncome !== undefined) updateData.userIncome = body.userIncome || null;
    if (body.partnerIncome !== undefined) updateData.partnerIncome = body.partnerIncome || null;
    if (body.userEmail !== undefined) updateData.userEmail = body.userEmail || null;
    if (body.partnerEmail !== undefined) updateData.partnerEmail = body.partnerEmail || null;
    if (body.userPhone !== undefined) updateData.userPhone = body.userPhone || null;
    if (body.partnerPhone !== undefined) updateData.partnerPhone = body.partnerPhone || null;
    if (body.userAddress !== undefined) updateData.userAddress = body.userAddress || null;
    if (body.partnerAddress !== undefined) updateData.partnerAddress = body.partnerAddress || null;
    if (body.children !== undefined) updateData.children = body.children || [];
    if (body.residenceAddress !== undefined) updateData.residenceAddress = body.residenceAddress || null;
    if (body.residenceOwnership !== undefined) updateData.residenceOwnership = body.residenceOwnership || null;
    if (body.expenseSplitType !== undefined) updateData.expenseSplitType = body.expenseSplitType || null;
    if (body.customExpenseSplit !== undefined) updateData.customExpenseSplit = body.customExpenseSplit || null;
    if (body.additionalClauses !== undefined) updateData.additionalClauses = body.additionalClauses || null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.status !== undefined) updateData.status = body.status || 'draft';

    const [updatedContract] = await db
      .update(familyContracts)
      .set(updateData)
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