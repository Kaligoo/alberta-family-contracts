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
    
    // Transform children data for backward compatibility (age -> birthdate)
    const transformedContracts = contracts.map(transformChildrenData);
    
    return NextResponse.json({ contracts: transformedContracts });
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
        // Schedule A fields
        scheduleIncomeEmployment: body.scheduleIncomeEmployment || null,
        scheduleIncomeEI: body.scheduleIncomeEI || null,
        scheduleIncomeWorkersComp: body.scheduleIncomeWorkersComp || null,
        scheduleIncomeInvestment: body.scheduleIncomeInvestment || null,
        scheduleIncomePension: body.scheduleIncomePension || null,
        scheduleIncomeGovernmentAssistance: body.scheduleIncomeGovernmentAssistance || null,
        scheduleIncomeSelfEmployment: body.scheduleIncomeSelfEmployment || null,
        scheduleIncomeOther: body.scheduleIncomeOther || null,
        scheduleIncomeTotalTaxReturn: body.scheduleIncomeTotalTaxReturn || null,
        scheduleAssetsRealEstate: body.scheduleAssetsRealEstate || [],
        scheduleAssetsVehicles: body.scheduleAssetsVehicles || [],
        scheduleAssetsFinancial: body.scheduleAssetsFinancial || [],
        scheduleAssetsPensions: body.scheduleAssetsPensions || [],
        scheduleAssetsBusiness: body.scheduleAssetsBusiness || [],
        scheduleAssetsOther: body.scheduleAssetsOther || [],
        scheduleDebtsSecured: body.scheduleDebtsSecured || [],
        scheduleDebtsUnsecured: body.scheduleDebtsUnsecured || [],
        scheduleDebtsOther: body.scheduleDebtsOther || [],
        status: 'draft',
        contractType: body.contractType || 'cohabitation',
      })
      .returning();

    // Transform children data for backward compatibility (age -> birthdate)
    const transformedContract = transformChildrenData(newContract);
    
    return NextResponse.json({ contract: transformedContract });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
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