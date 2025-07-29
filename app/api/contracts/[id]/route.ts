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
    
    if (!userWithTeam?.teamId || !contractId || isNaN(contractId)) {
      console.error('Invalid request parameters:', { 
        teamId: userWithTeam?.teamId, 
        contractId, 
        rawId: id,
        isNaN: isNaN(contractId)
      });
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Update contract - only update fields that are provided
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that are present in the request body
    // Use empty string as null for string fields to allow clearing
    if (body.userFullName !== undefined) updateData.userFullName = body.userFullName === '' ? null : body.userFullName;
    if (body.partnerFullName !== undefined) updateData.partnerFullName = body.partnerFullName === '' ? null : body.partnerFullName;
    if (body.userFirstName !== undefined) updateData.userFirstName = body.userFirstName === '' ? null : body.userFirstName;
    if (body.partnerFirstName !== undefined) updateData.partnerFirstName = body.partnerFirstName === '' ? null : body.partnerFirstName;
    if (body.userPronouns !== undefined) updateData.userPronouns = body.userPronouns === '' ? null : body.userPronouns;
    if (body.partnerPronouns !== undefined) updateData.partnerPronouns = body.partnerPronouns === '' ? null : body.partnerPronouns;
    if (body.userAge !== undefined) updateData.userAge = body.userAge === '' ? null : parseInt(body.userAge);
    if (body.partnerAge !== undefined) updateData.partnerAge = body.partnerAge === '' ? null : parseInt(body.partnerAge);
    if (body.cohabDate !== undefined) {
      if (body.cohabDate === '') {
        updateData.cohabDate = null;
      } else {
        const cohabDate = new Date(body.cohabDate);
        updateData.cohabDate = isNaN(cohabDate.getTime()) ? null : cohabDate;
        console.log('Saving cohabDate:', body.cohabDate, '->', updateData.cohabDate);
      }
    }
    if (body.proposedMarriageDate !== undefined) {
      if (body.proposedMarriageDate === '') {
        updateData.proposedMarriageDate = null;
      } else {
        const proposedDate = new Date(body.proposedMarriageDate);
        updateData.proposedMarriageDate = isNaN(proposedDate.getTime()) ? null : proposedDate;
        console.log('Saving proposedMarriageDate:', body.proposedMarriageDate, '->', updateData.proposedMarriageDate);
      }
    }
    if (body.userJobTitle !== undefined) updateData.userJobTitle = body.userJobTitle === '' ? null : body.userJobTitle;
    if (body.partnerJobTitle !== undefined) updateData.partnerJobTitle = body.partnerJobTitle === '' ? null : body.partnerJobTitle;
    if (body.userIncome !== undefined) updateData.userIncome = body.userIncome === '' ? null : body.userIncome;
    if (body.partnerIncome !== undefined) updateData.partnerIncome = body.partnerIncome === '' ? null : body.partnerIncome;
    if (body.userEmail !== undefined) updateData.userEmail = body.userEmail === '' ? null : body.userEmail;
    if (body.partnerEmail !== undefined) updateData.partnerEmail = body.partnerEmail === '' ? null : body.partnerEmail;
    if (body.userPhone !== undefined) updateData.userPhone = body.userPhone === '' ? null : body.userPhone;
    if (body.partnerPhone !== undefined) updateData.partnerPhone = body.partnerPhone === '' ? null : body.partnerPhone;
    if (body.userAddress !== undefined) updateData.userAddress = body.userAddress === '' ? null : body.userAddress;
    if (body.partnerAddress !== undefined) updateData.partnerAddress = body.partnerAddress === '' ? null : body.partnerAddress;
    if (body.userLawyer !== undefined) updateData.userLawyer = body.userLawyer === '' ? null : body.userLawyer;
    if (body.partnerLawyer !== undefined) updateData.partnerLawyer = body.partnerLawyer === '' ? null : body.partnerLawyer;
    if (body.children !== undefined) updateData.children = body.children || [];
    if (body.residenceAddress !== undefined) updateData.residenceAddress = body.residenceAddress === '' ? null : body.residenceAddress;
    if (body.residenceOwnership !== undefined) updateData.residenceOwnership = body.residenceOwnership === '' ? null : body.residenceOwnership;
    if (body.expenseSplitType !== undefined) updateData.expenseSplitType = body.expenseSplitType === '' ? null : body.expenseSplitType;
    if (body.customExpenseSplit !== undefined) updateData.customExpenseSplit = body.customExpenseSplit || null;
    if (body.additionalClauses !== undefined) updateData.additionalClauses = body.additionalClauses === '' ? null : body.additionalClauses;
    if (body.notes !== undefined) updateData.notes = body.notes === '' ? null : body.notes;
    if (body.status !== undefined) updateData.status = body.status || 'draft';

    console.log('Updating contract with:', {
      contractId,
      userId: user.id,
      teamId: userWithTeam.teamId,
      updateDataKeys: Object.keys(updateData)
    });

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

    console.log('Update result:', {
      found: !!updatedContract,
      updatedId: updatedContract?.id
    });

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