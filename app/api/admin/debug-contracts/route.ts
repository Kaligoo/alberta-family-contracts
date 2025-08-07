import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all contracts in the database
    const allContracts = await db
      .select({
        id: familyContracts.id,
        userFullName: familyContracts.userFullName,
        partnerFullName: familyContracts.partnerFullName,
        userId: familyContracts.userId,
        status: familyContracts.status,
        createdAt: familyContracts.createdAt,
      })
      .from(familyContracts);

    // Get admin user info
    const [adminUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'garrett.horvath@gmail.com'))
      .limit(1);

    return NextResponse.json({
      currentUser: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email
      } : null,
      totalContracts: allContracts.length,
      contracts: allContracts,
      contractsByUser: allContracts.reduce((acc, contract) => {
        acc[contract.userId] = (acc[contract.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    });
  } catch (error) {
    console.error('Error debugging contracts:', error);
    return NextResponse.json(
      { error: 'Failed to debug contracts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}