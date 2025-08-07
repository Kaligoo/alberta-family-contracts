import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const contractId = url.searchParams.get('contractId');
    
    if (!contractId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get specific contract for this user
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(
        and(
          eq(familyContracts.id, parseInt(contractId)),
          eq(familyContracts.userId, user.id)
        )
      )
      .limit(1);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    // Debug information
    const debugInfo = {
      contractId: contract.id,
      isPaid: contract.isPaid,
      isPaidType: typeof contract.isPaid,
      isPaidValue: JSON.stringify(contract.isPaid),
      status: contract.status,
      statusType: typeof contract.status,
      isCurrentContract: contract.isCurrentContract,
      
      // Test our current logic
      currentLogicResult: (contract.isPaid === 'true') || (contract.isPaid as any === true),
      
      // Test alternative values
      tests: {
        equalTrue: (contract.isPaid as any) === true,
        equalStringTrue: contract.isPaid === 'true',
        equalOne: (contract.isPaid as any) === 1,
        equalStringOne: contract.isPaid === '1',
        truthyTest: !!contract.isPaid,
        existsTest: contract.isPaid != null,
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Error debugging contract status:', error);
    return NextResponse.json(
      { error: 'Failed to debug contract status' },
      { status: 500 }
    );
  }
}