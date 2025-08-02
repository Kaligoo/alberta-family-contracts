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

    // Transform children data for backward compatibility (age -> birthdate)
    const transformedContract = transformChildrenData(contract);

    return NextResponse.json({ contract: transformedContract });
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
    if (body.propertySeparationType !== undefined) updateData.propertySeparationType = body.propertySeparationType === '' ? null : body.propertySeparationType;
    
    // Schedule A fields
    if (body.scheduleIncomeEmployment !== undefined) updateData.scheduleIncomeEmployment = body.scheduleIncomeEmployment === '' ? null : body.scheduleIncomeEmployment;
    if (body.scheduleIncomeEI !== undefined) updateData.scheduleIncomeEI = body.scheduleIncomeEI === '' ? null : body.scheduleIncomeEI;
    if (body.scheduleIncomeWorkersComp !== undefined) updateData.scheduleIncomeWorkersComp = body.scheduleIncomeWorkersComp === '' ? null : body.scheduleIncomeWorkersComp;
    if (body.scheduleIncomeInvestment !== undefined) updateData.scheduleIncomeInvestment = body.scheduleIncomeInvestment === '' ? null : body.scheduleIncomeInvestment;
    if (body.scheduleIncomePension !== undefined) updateData.scheduleIncomePension = body.scheduleIncomePension === '' ? null : body.scheduleIncomePension;
    if (body.scheduleIncomeGovernmentAssistance !== undefined) updateData.scheduleIncomeGovernmentAssistance = body.scheduleIncomeGovernmentAssistance === '' ? null : body.scheduleIncomeGovernmentAssistance;
    if (body.scheduleIncomeSelfEmployment !== undefined) updateData.scheduleIncomeSelfEmployment = body.scheduleIncomeSelfEmployment === '' ? null : body.scheduleIncomeSelfEmployment;
    if (body.scheduleIncomeOther !== undefined) updateData.scheduleIncomeOther = body.scheduleIncomeOther === '' ? null : body.scheduleIncomeOther;
    if (body.scheduleIncomeTotalTaxReturn !== undefined) updateData.scheduleIncomeTotalTaxReturn = body.scheduleIncomeTotalTaxReturn === '' ? null : body.scheduleIncomeTotalTaxReturn;
    if (body.scheduleAssetsRealEstate !== undefined) updateData.scheduleAssetsRealEstate = body.scheduleAssetsRealEstate || [];
    if (body.scheduleAssetsVehicles !== undefined) updateData.scheduleAssetsVehicles = body.scheduleAssetsVehicles || [];
    if (body.scheduleAssetsFinancial !== undefined) updateData.scheduleAssetsFinancial = body.scheduleAssetsFinancial || [];
    if (body.scheduleAssetsPensions !== undefined) updateData.scheduleAssetsPensions = body.scheduleAssetsPensions || [];
    if (body.scheduleAssetsBusiness !== undefined) updateData.scheduleAssetsBusiness = body.scheduleAssetsBusiness || [];
    if (body.scheduleAssetsOther !== undefined) updateData.scheduleAssetsOther = body.scheduleAssetsOther || [];
    if (body.scheduleDebtsSecured !== undefined) updateData.scheduleDebtsSecured = body.scheduleDebtsSecured || [];
    if (body.scheduleDebtsUnsecured !== undefined) updateData.scheduleDebtsUnsecured = body.scheduleDebtsUnsecured || [];
    if (body.scheduleDebtsOther !== undefined) updateData.scheduleDebtsOther = body.scheduleDebtsOther || [];

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

    // Transform children data for backward compatibility (age -> birthdate)
    const transformedContract = transformChildrenData(updatedContract);

    return NextResponse.json({ contract: transformedContract });
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

// Helper function to transform children data from old age format to new birthdate format
function transformChildrenData(contract: any) {
  if (!contract.children || !Array.isArray(contract.children)) {
    return contract;
  }

  const transformedChildren = contract.children.map((child: any) => {
    // If child has age but no birthdate, convert age to approximate birthdate
    if (child.age && !child.birthdate) {
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(child.age);
      // Create a birthdate on January 1st of the calculated year
      const approximateBirthdate = `${birthYear}-01-01`;
      
      return {
        name: child.name,
        birthdate: approximateBirthdate,
        relationship: child.relationship || 'biological',
        parentage: child.parentage || 'both'
      };
    }
    
    // If child already has birthdate, return as-is
    if (child.birthdate) {
      return {
        name: child.name,
        birthdate: child.birthdate,
        relationship: child.relationship || 'biological',
        parentage: child.parentage || 'both'
      };
    }
    
    // If child has neither age nor birthdate, return with empty birthdate
    return {
      name: child.name,
      birthdate: undefined,
      relationship: child.relationship || 'biological',
      parentage: child.parentage || 'both'
    };
  });

  return {
    ...contract,
    children: transformedChildren
  };
}