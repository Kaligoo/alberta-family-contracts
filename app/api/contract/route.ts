import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const contractId = url.searchParams.get('id');

  // If an ID is provided, fetch that specific contract
  if (contractId) {
    try {
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const [contract] = await db
        .select()
        .from(familyContracts)
        .where(
          and(
            eq(familyContracts.id, parseInt(contractId, 10)),
            eq(familyContracts.userId, user.id)
          )
        );

      if (!contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
      }

      return NextResponse.json({ contract });
    } catch (error) {
      console.error('Error fetching specific contract:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contract data' },
        { status: 500 }
      );
    }
  }
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's current contract - try current contract first, fallback to most recent
    let contract = null;
    
    // First try to find a contract marked as current
    try {
      [contract] = await db
        .select({
          id: familyContracts.id,
          userId: familyContracts.userId,
          userFullName: familyContracts.userFullName,
          partnerFullName: familyContracts.partnerFullName,
          userFirstName: familyContracts.userFirstName,
          partnerFirstName: familyContracts.partnerFirstName,
          userPronouns: familyContracts.userPronouns,
          partnerPronouns: familyContracts.partnerPronouns,
          userAge: familyContracts.userAge,
          partnerAge: familyContracts.partnerAge,
          userJobTitle: familyContracts.userJobTitle,
          partnerJobTitle: familyContracts.partnerJobTitle,
          userIncome: familyContracts.userIncome,
          partnerIncome: familyContracts.partnerIncome,
          cohabDate: familyContracts.cohabDate,
          proposedMarriageDate: familyContracts.proposedMarriageDate,
          userEmail: familyContracts.userEmail,
          userPhone: familyContracts.userPhone,
          userAddress: familyContracts.userAddress,
          userLawyer: familyContracts.userLawyer,
          partnerEmail: familyContracts.partnerEmail,
          partnerPhone: familyContracts.partnerPhone,
          partnerAddress: familyContracts.partnerAddress,
          partnerLawyer: familyContracts.partnerLawyer,
          children: familyContracts.children,
          contractType: familyContracts.contractType,
          propertySeparationType: familyContracts.propertySeparationType,
          status: familyContracts.status,
          residenceAddress: familyContracts.residenceAddress,
          residenceOwnership: familyContracts.residenceOwnership,
          expenseSplitType: familyContracts.expenseSplitType,
          customExpenseSplit: familyContracts.customExpenseSplit,
          additionalClauses: familyContracts.additionalClauses,
          notes: familyContracts.notes,
          documentGenerated: familyContracts.documentGenerated,
          documentPath: familyContracts.documentPath,
          isCurrentContract: familyContracts.isCurrentContract,
          isPaid: familyContracts.isPaid,
          termsAccepted: familyContracts.termsAccepted,
          termsAcceptedAt: familyContracts.termsAcceptedAt,
          createdAt: familyContracts.createdAt,
          updatedAt: familyContracts.updatedAt,
        })
        .from(familyContracts)
        .where(
          and(
            eq(familyContracts.userId, user.id),
            eq(familyContracts.isCurrentContract, 'true')
          )
        )
        .limit(1);
    } catch (error) {
      console.log('Error finding current contract, will try most recent:', error);
    }

    // If no current contract found, get the most recent one
    if (!contract) {
      try {
        [contract] = await db
          .select({
            id: familyContracts.id,
            userId: familyContracts.userId,
            userFullName: familyContracts.userFullName,
            partnerFullName: familyContracts.partnerFullName,
            userFirstName: familyContracts.userFirstName,
            partnerFirstName: familyContracts.partnerFirstName,
            userPronouns: familyContracts.userPronouns,
            partnerPronouns: familyContracts.partnerPronouns,
            userAge: familyContracts.userAge,
            partnerAge: familyContracts.partnerAge,
            userJobTitle: familyContracts.userJobTitle,
            partnerJobTitle: familyContracts.partnerJobTitle,
            userIncome: familyContracts.userIncome,
            partnerIncome: familyContracts.partnerIncome,
            cohabDate: familyContracts.cohabDate,
            proposedMarriageDate: familyContracts.proposedMarriageDate,
            userEmail: familyContracts.userEmail,
            userPhone: familyContracts.userPhone,
            userAddress: familyContracts.userAddress,
            userLawyer: familyContracts.userLawyer,
            partnerEmail: familyContracts.partnerEmail,
            partnerPhone: familyContracts.partnerPhone,
            partnerAddress: familyContracts.partnerAddress,
            partnerLawyer: familyContracts.partnerLawyer,
            children: familyContracts.children,
            contractType: familyContracts.contractType,
            propertySeparationType: familyContracts.propertySeparationType,
            status: familyContracts.status,
            residenceAddress: familyContracts.residenceAddress,
            residenceOwnership: familyContracts.residenceOwnership,
            expenseSplitType: familyContracts.expenseSplitType,
            customExpenseSplit: familyContracts.customExpenseSplit,
            additionalClauses: familyContracts.additionalClauses,
            notes: familyContracts.notes,
            documentGenerated: familyContracts.documentGenerated,
            documentPath: familyContracts.documentPath,
            isCurrentContract: familyContracts.isCurrentContract,
            isPaid: familyContracts.isPaid,
            termsAccepted: familyContracts.termsAccepted,
            termsAcceptedAt: familyContracts.termsAcceptedAt,
            createdAt: familyContracts.createdAt,
            updatedAt: familyContracts.updatedAt,
          })
          .from(familyContracts)
          .where(eq(familyContracts.userId, user.id))
          .orderBy(desc(familyContracts.updatedAt))
          .limit(1);
      } catch (error) {
        console.error('Error finding most recent contract:', error);
      }
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