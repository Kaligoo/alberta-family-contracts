import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendAdminSaleNotification } from '@/lib/utils/admin-notifications';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    // Simple admin check - in production you'd want better auth
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { contractId } = await request.json();
    
    if (!contractId) {
      return NextResponse.json({ error: 'Contract ID required' }, { status: 400 });
    }

    // Update contract as paid
    const [updatedContract] = await db
      .update(familyContracts)
      .set({
        isPaid: 'true',
        status: 'paid',
        updatedAt: new Date()
      })
      .where(eq(familyContracts.id, parseInt(contractId)))
      .returning();

    if (updatedContract) {
      // Send admin notification
      const contractType = updatedContract.contractType === 'cohabitation' 
        ? 'Alberta Cohabitation Agreement'
        : updatedContract.contractType === 'prenuptial'
        ? 'Alberta Prenuptial Agreement' 
        : 'Alberta Family Agreement';

      await sendAdminSaleNotification(
        contractId,
        updatedContract.userFullName || 'Unknown User',
        updatedContract.partnerFullName || 'Unknown Partner',
        contractType
      );

      return NextResponse.json({ 
        success: true, 
        message: `Contract ${contractId} marked as paid`,
        contract: updatedContract
      });
    } else {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error marking contract as paid:', error);
    return NextResponse.json(
      { error: 'Failed to mark contract as paid' },
      { status: 500 }
    );
  }
}