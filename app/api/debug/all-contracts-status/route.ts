import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all contracts for this user
    const contracts = await db
      .select({
        id: familyContracts.id,
        userFullName: familyContracts.userFullName,
        partnerFullName: familyContracts.partnerFullName,
        status: familyContracts.status,
        isPaid: familyContracts.isPaid,
        isCurrentContract: familyContracts.isCurrentContract,
        createdAt: familyContracts.createdAt,
        updatedAt: familyContracts.updatedAt
      })
      .from(familyContracts)
      .where(eq(familyContracts.userId, user.id));

    // Debug information for each contract
    const debugInfo = contracts.map(contract => ({
      id: contract.id,
      names: `${contract.userFullName || 'No name'} & ${contract.partnerFullName || 'No name'}`,
      status: contract.status,
      statusType: typeof contract.status,
      isPaid: contract.isPaid,
      isPaidType: typeof contract.isPaid,
      isCurrentContract: contract.isCurrentContract,
      
      // Test our payment logic
      paymentTests: {
        isPaidTrue: contract.isPaid === 'true',
        isPaidBoolTrue: (contract.isPaid as any) === true,
        statusPaid: contract.status === 'paid',
        statusCompleted: contract.status === 'completed',
        currentLogic: contract.isPaid === 'true' || (contract.isPaid as any) === true
      },
      
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt
    }));

    return NextResponse.json({
      totalContracts: contracts.length,
      contracts: debugInfo
    });
  } catch (error) {
    console.error('Error debugging all contracts:', error);
    return NextResponse.json(
      { error: 'Failed to debug contracts' },
      { status: 500 }
    );
  }
}