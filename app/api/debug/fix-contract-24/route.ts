import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendAdminSaleNotification } from '@/lib/utils/admin-notifications';

export async function POST(request: NextRequest) {
  try {
    const contractId = 24;
    
    console.log(`Manually fixing payment status for contract ${contractId}`);
    
    // Update contract as paid
    const [updatedContract] = await db
      .update(familyContracts)
      .set({
        isPaid: 'true',
        status: 'paid',
        updatedAt: new Date()
      })
      .where(eq(familyContracts.id, contractId))
      .returning();

    if (updatedContract) {
      console.log(`Successfully marked contract ${contractId} as paid`);
      
      // Send admin notification
      const contractType = updatedContract.contractType === 'cohabitation' 
        ? 'Alberta Cohabitation Agreement'
        : updatedContract.contractType === 'prenuptial'
        ? 'Alberta Prenuptial Agreement' 
        : 'Alberta Family Agreement';

      // Prepare contact information for admin notification
      const contactInfo = {
        userEmail: updatedContract.userEmail || undefined,
        userPhone: updatedContract.userPhone || undefined,
        partnerEmail: updatedContract.partnerEmail || undefined,
        partnerPhone: updatedContract.partnerPhone || undefined
      };

      await sendAdminSaleNotification(
        contractId.toString(),
        updatedContract.userFullName || 'Unknown User',
        updatedContract.partnerFullName || 'Unknown Partner',
        contractType,
        undefined, // no payment amount for debug
        contactInfo,
        undefined // lawyerInfo - not available at payment time
      );

      return NextResponse.json({ 
        success: true, 
        message: `Contract ${contractId} marked as paid manually`,
        contract: {
          id: updatedContract.id,
          status: updatedContract.status,
          isPaid: updatedContract.isPaid,
          userFullName: updatedContract.userFullName,
          partnerFullName: updatedContract.partnerFullName,
          contractType: updatedContract.contractType
        }
      });
    } else {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error fixing contract 24:', error);
    return NextResponse.json(
      { error: 'Failed to fix contract payment status' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Just check the current status of contract 24
    const [contract] = await db
      .select({
        id: familyContracts.id,
        status: familyContracts.status,
        isPaid: familyContracts.isPaid,
        userFullName: familyContracts.userFullName,
        partnerFullName: familyContracts.partnerFullName,
        contractType: familyContracts.contractType,
        createdAt: familyContracts.createdAt,
        updatedAt: familyContracts.updatedAt
      })
      .from(familyContracts)
      .where(eq(familyContracts.id, 24))
      .limit(1);

    if (contract) {
      return NextResponse.json({
        success: true,
        contract
      });
    } else {
      return NextResponse.json({ error: 'Contract 24 not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('Error checking contract 24:', error);
    return NextResponse.json(
      { error: 'Failed to check contract status' },
      { status: 500 }
    );
  }
}