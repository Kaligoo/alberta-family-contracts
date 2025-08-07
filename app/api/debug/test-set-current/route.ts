import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('🔍 Testing set-current functionality...');
    
    // Step 1: Get current user
    const user = await getUser();
    console.log('User:', user ? { id: user.id, email: user.email } : 'No user');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No authenticated user found'
      });
    }

    // Step 2: Get all user's contracts
    const userContracts = await db
      .select({
        id: familyContracts.id,
        userFullName: familyContracts.userFullName,
        partnerFullName: familyContracts.partnerFullName,
        isCurrentContract: familyContracts.isCurrentContract,
        status: familyContracts.status,
        createdAt: familyContracts.createdAt
      })
      .from(familyContracts)
      .where(eq(familyContracts.userId, user.id));

    console.log(`Found ${userContracts.length} contracts for user ${user.id}`);

    if (userContracts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No contracts found for user',
        userId: user.id
      });
    }

    // Step 3: Try to test set-current on the first contract
    const firstContract = userContracts[0];
    console.log('Testing with contract:', firstContract.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      contracts: userContracts,
      testContractId: firstContract.id,
      message: `Ready to test set-current with contract ${firstContract.id}. Visit: /api/debug/test-set-current/${firstContract.id}`
    });

  } catch (error) {
    console.error('❌ Test set-current debug error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}