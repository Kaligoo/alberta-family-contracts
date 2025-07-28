import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
    
    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const resolvedParams = await params;
    const contractId = parseInt(resolvedParams.id);
    
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

    // Generate PDF using pdf-lib
    const pdfBytes = await generateContractPDF(contract, user);
    
    return new NextResponse(pdfBytes, {
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

async function generateContractPDF(contract: any, user: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.276, 841.890]); // A4 size in points
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - margin;
  
  // Helper function to add text
  const addText = (text: string, fontSize: number = 12, font = helveticaFont, isBold = false) => {
    const actualFont = isBold ? helveticaBoldFont : font;
    page.drawText(text, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: actualFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= fontSize + 8; // Add some spacing
  };
  
  // Helper function to add section spacing
  const addSpacing = (space: number = 20) => {
    yPosition -= space;
  };

  // Document Title
  addText('ALBERTA COHABITATION AGREEMENT', 20, helveticaBoldFont, true);
  addSpacing(30);
  
  // Party Information
  addText('PARTIES TO THIS AGREEMENT', 16, helveticaBoldFont, true);
  addSpacing(15);
  
  addText(`Party A: ${contract.userFullName || '[Your Name]'}`, 12);
  if (contract.userAddress) {
    addText(`Address: ${contract.userAddress}`, 11);
  }
  if (contract.userEmail) {
    addText(`Email: ${contract.userEmail}`, 11);
  }
  if (contract.userPhone) {
    addText(`Phone: ${contract.userPhone}`, 11);
  }
  addSpacing();
  
  addText(`Party B: ${contract.partnerFullName || '[Partner Name]'}`, 12);
  if (contract.partnerAddress) {
    addText(`Address: ${contract.partnerAddress}`, 11);
  }
  if (contract.partnerEmail) {
    addText(`Email: ${contract.partnerEmail}`, 11);
  }
  if (contract.partnerPhone) {
    addText(`Phone: ${contract.partnerPhone}`, 11);
  }
  addSpacing(30);
  
  // Agreement Details
  addText('AGREEMENT DETAILS', 16, helveticaBoldFont, true);
  addSpacing(15);
  
  const currentDate = new Date().toLocaleDateString('en-CA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  addText(`Date of Agreement: ${currentDate}`, 12);
  
  if (contract.cohabDate) {
    const cohabDate = new Date(contract.cohabDate).toLocaleDateString('en-CA', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    addText(`Date Cohabitation Began: ${cohabDate}`, 12);
  }
  
  if (contract.residenceAddress) {
    addText(`Residence Address: ${contract.residenceAddress}`, 12);
  }
  
  if (contract.residenceOwnership) {
    let ownershipText = 'Residence Ownership: ';
    switch(contract.residenceOwnership) {
      case 'joint': ownershipText += 'Joint ownership'; break;
      case 'user': ownershipText += 'Owned by Party A'; break;
      case 'partner': ownershipText += 'Owned by Party B'; break;
      case 'rental': ownershipText += 'Rental property'; break;
      default: ownershipText += contract.residenceOwnership;
    }
    addText(ownershipText, 12);
  }
  
  addSpacing(30);
  
  // Financial Information
  addText('FINANCIAL INFORMATION', 16, helveticaBoldFont, true);
  addSpacing(15);
  
  if (contract.userIncome) {
    addText(`Party A Annual Income: $${parseInt(contract.userIncome).toLocaleString()} CAD`, 12);
  }
  if (contract.partnerIncome) {
    addText(`Party B Annual Income: $${parseInt(contract.partnerIncome).toLocaleString()} CAD`, 12);
  }
  
  if (contract.expenseSplitType) {
    let expenseText = 'Expense Arrangement: ';
    switch(contract.expenseSplitType) {
      case 'equal': expenseText += 'Equal split (50/50)'; break;
      case 'proportional': expenseText += 'Proportional to income'; break;
      case 'custom': expenseText += 'Custom arrangement'; break;
      default: expenseText += contract.expenseSplitType;
    }
    addText(expenseText, 12);
  }
  
  addSpacing(30);
  
  // Employment Information
  if (contract.userJobTitle || contract.partnerJobTitle) {
    addText('EMPLOYMENT INFORMATION', 16, helveticaBoldFont, true);
    addSpacing(15);
    
    if (contract.userJobTitle) {
      addText(`Party A Occupation: ${contract.userJobTitle}`, 12);
    }
    if (contract.partnerJobTitle) {
      addText(`Party B Occupation: ${contract.partnerJobTitle}`, 12);
    }
    addSpacing(30);
  }
  
  // Children Information
  if (contract.children && contract.children.length > 0) {
    addText('CHILDREN', 16, helveticaBoldFont, true);
    addSpacing(15);
    
    contract.children.forEach((child: any, index: number) => {
      let childText = `Child ${index + 1}: ${child.name}`;
      if (child.age) childText += ` (Age ${child.age})`;
      addText(childText, 12);
      
      if (child.relationship && child.parentage) {
        let relationshipText = `Relationship: ${child.relationship}`;
        if (child.parentage === 'both') {
          relationshipText += ', child of both parties';
        } else if (child.parentage === 'user') {
          relationshipText += ', child of Party A';
        } else if (child.parentage === 'partner') {
          relationshipText += ', child of Party B';
        }
        addText(relationshipText, 11);
      }
      addSpacing(10);
    });
    addSpacing(20);
  }
  
  // Legal Counsel
  if (contract.userLawyer || contract.partnerLawyer) {
    addText('LEGAL REPRESENTATION', 16, helveticaBoldFont, true);
    addSpacing(15);
    
    if (contract.userLawyer) {
      addText(`Party A Legal Counsel: ${contract.userLawyer}`, 12);
    }
    if (contract.partnerLawyer) {
      addText(`Party B Legal Counsel: ${contract.partnerLawyer}`, 12);
    }
    addSpacing(30);
  }
  
  // Additional Clauses
  if (contract.additionalClauses) {
    addText('ADDITIONAL CLAUSES', 16, helveticaBoldFont, true);
    addSpacing(15);
    
    // Split long text into lines that fit the page width
    const maxLineLength = Math.floor((width - 2 * margin) / 6); // Approximate character width
    const lines = contract.additionalClauses.split('\n');
    lines.forEach((line: string) => {
      if (line.length > maxLineLength) {
        const words = line.split(' ');
        let currentLine = '';
        words.forEach((word: string) => {
          if ((currentLine + word).length > maxLineLength) {
            if (currentLine) {
              addText(currentLine.trim(), 11);
              currentLine = word + ' ';
            } else {
              addText(word, 11); // Single long word
            }
          } else {
            currentLine += word + ' ';
          }
        });
        if (currentLine) {
          addText(currentLine.trim(), 11);
        }
      } else {
        addText(line, 11);
      }
    });
    addSpacing(30);
  }
  
  // Notes
  if (contract.notes) {
    addText('NOTES', 16, helveticaBoldFont, true);
    addSpacing(15);
    
    const maxLineLength = Math.floor((width - 2 * margin) / 6);
    const lines = contract.notes.split('\n');
    lines.forEach((line: string) => {
      if (line.length > maxLineLength) {
        const words = line.split(' ');
        let currentLine = '';
        words.forEach((word: string) => {
          if ((currentLine + word).length > maxLineLength) {
            if (currentLine) {
              addText(currentLine.trim(), 11);
              currentLine = word + ' ';
            } else {
              addText(word, 11);
            }
          } else {
            currentLine += word + ' ';
          }
        });
        if (currentLine) {
          addText(currentLine.trim(), 11);
        }
      } else {
        addText(line, 11);
      }
    });
    addSpacing(30);
  }
  
  // Footer
  yPosition = 100; // Position near bottom
  addText('IMPORTANT NOTICE', 14, helveticaBoldFont, true);
  addSpacing(10);
  addText('This document is a draft cohabitation agreement generated for informational', 10);
  addText('purposes only. It should be reviewed by qualified legal counsel before signing.', 10);
  addText('Alberta Family Contracts does not provide legal advice.', 10);
  addSpacing(20);
  addText(`Generated on: ${currentDate}`, 10);
  addText(`Contract ID: #${contract.id}`, 10);
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}