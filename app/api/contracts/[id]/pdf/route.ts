import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithTeam = await getUserWithTeam(user.id);
    
    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const contractId = parseInt(params.id);
    
    if (isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid contract ID' }, { status: 400 });
    }

    // Get the contract to verify ownership
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

    // For now, return a simple PDF response
    // In production, you'd use a library like Puppeteer or PDF-lib to generate actual PDFs
    const pdfContent = generateContractPDF(contract);
    
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cohabitation-agreement-${contractId}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateContractPDF(contract: any): ArrayBuffer {
  // For demonstration, create a simple text-based PDF placeholder
  // In production, use a proper PDF generation library
  const pdfText = `
ALBERTA COHABITATION AGREEMENT

Parties:
Party A: ${contract.userFullName || 'Not specified'}
Party B: ${contract.partnerFullName || 'Not specified'}

This is a simplified PDF for testing purposes.
In production, this would be a properly formatted legal document.

Generated on: ${new Date().toLocaleDateString()}
Contract ID: ${contract.id}
  `.trim();

  // Convert text to ArrayBuffer (this is just for demo)
  const encoder = new TextEncoder();
  return encoder.encode(pdfText).buffer;
}