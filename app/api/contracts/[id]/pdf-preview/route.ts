import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts, templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { generateResidenceContent } from '@/lib/content/residence-content';

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

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
    const resolvedParams = await params;
    const contractId = parseInt(resolvedParams.id);
    
    if (!userWithTeam?.teamId || isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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

    // Generate watermarked PDF preview using same Word template system
    const pdfBytes = await generateWatermarkedPDFPreview(contract, user);
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error generating PDF preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF preview' },
      { status: 500 }
    );
  }
}

async function generateWatermarkedPDFPreview(contract: any, user: any): Promise<Uint8Array> {
  try {
    console.log('Starting watermarked PDF preview generation...');
    
    // Get active template from database (same as full PDF system)
    const activeTemplate = await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, 'true'))
      .limit(1);

    if (activeTemplate.length === 0) {
      throw new Error('No active template found for PDF preview generation');
    }

    const template = activeTemplate[0];
    const templateData = prepareTemplateDataWithWatermark(contract, user);
    
    // Generate watermarked Word document using existing template system
    const templateBuffer = Buffer.from(template.content, 'base64');
    const zip = new PizZip(templateBuffer);
    
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{',
        end: '}'
      }
    });

    doc.render(templateData);
    const watermarkedDocxBuffer = doc.getZip().generate({ type: 'nodebuffer' });
    
    // Convert to PDF using Gotenberg (same as PDF v2) for consistency
    const pdfBuffer = await convertWatermarkedWordToPDF(watermarkedDocxBuffer);
    
    // Limit to first 3 pages for preview
    const previewPdfBuffer = await limitPDFToFirstPages(pdfBuffer, 3);
    
    console.log('Successfully generated watermarked PDF preview');
    return new Uint8Array(previewPdfBuffer);
    
  } catch (error) {
    console.error('Failed to generate watermarked PDF preview:', error);
    throw error;
  }
}

async function convertWatermarkedWordToPDF(docxBuffer: Buffer): Promise<Buffer> {
  // Use production Gotenberg service (same as PDF v2)
  const GOTENBERG_URL = process.env.GOTENBERG_URL || 'https://gotenberg-service-162295646145.us-central1.run.app';
  
  try {
    console.log('Converting watermarked Word document to PDF using Gotenberg...');
    
    // Create form data for Gotenberg LibreOffice conversion
    const formData = new FormData();
    
    // Add the watermarked Word document file
    const docxBlob = new Blob([docxBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    formData.append('files', docxBlob, 'contract-preview.docx');
    
    // Send request to Gotenberg LibreOffice conversion endpoint
    const response = await fetch(`${GOTENBERG_URL}/forms/libreoffice/convert`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gotenberg LibreOffice conversion returned ${response.status}: ${errorText}`);
    }
    
    // Get PDF buffer
    const arrayBuffer = await response.arrayBuffer();
    console.log('Successfully converted watermarked Word document to PDF');
    return Buffer.from(arrayBuffer);
    
  } catch (error) {
    console.error('Failed to convert watermarked Word document:', error);
    throw error;
  }
}

async function limitPDFToFirstPages(pdfBuffer: Buffer, maxPages: number): Promise<Buffer> {
  try {
    // Import PDF-lib dynamically
    const PDFLib = await import('pdf-lib');
    const { PDFDocument, rgb, degrees } = PDFLib;
    
    console.log(`Limiting PDF to first ${maxPages} pages and adding watermarks...`);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = pdfDoc.getPageCount();
    
    console.log(`Original PDF has ${totalPages} pages, limiting to ${maxPages}`);
    
    // Create new PDF with only first pages
    const newPdfDoc = await PDFDocument.create();
    
    // Copy first maxPages pages
    const pagesToCopy = Array.from({ length: Math.min(maxPages, totalPages) }, (_, i) => i);
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToCopy);
    
    // Add copied pages to new document with watermarks
    copiedPages.forEach((page, index) => {
      const addedPage = newPdfDoc.addPage(page);
      
      // Add diagonal watermark to each page
      const { width, height } = addedPage.getSize();
      
      // Main diagonal watermark
      addedPage.drawText('PREVIEW ONLY', {
        x: width / 2 - 100,
        y: height / 2,
        size: 48,
        color: rgb(0.9, 0.5, 0.1), // Orange color
        opacity: 0.3,
        rotate: degrees(-45),
      });
      
      // Additional smaller watermarks
      addedPage.drawText('PREVIEW', {
        x: width / 4,
        y: height / 4,
        size: 24,
        color: rgb(0.9, 0.5, 0.1),
        opacity: 0.2,
        rotate: degrees(-45),
      });
      
      addedPage.drawText('PREVIEW', {
        x: (width * 3) / 4,
        y: (height * 3) / 4,
        size: 24,
        color: rgb(0.9, 0.5, 0.1),
        opacity: 0.2,
        rotate: degrees(-45),
      });
      
      // Header watermark
      addedPage.drawText('• PREVIEW DOCUMENT • NOT FOR LEGAL USE •', {
        x: 50,
        y: height - 30,
        size: 10,
        color: rgb(0.8, 0.3, 0.1),
        opacity: 0.8,
      });
      
      // Footer watermark
      addedPage.drawText(`Preview Page ${index + 1} of ${Math.min(maxPages, totalPages)} • Purchase full agreement at Agreeable.ca`, {
        x: 50,
        y: 20,
        size: 8,
        color: rgb(0.6, 0.6, 0.6),
        opacity: 0.9,
      });
    });
    
    // Serialize the new PDF
    const limitedPdfBytes = await newPdfDoc.save();
    console.log(`Successfully limited PDF to ${Math.min(maxPages, totalPages)} pages with watermarks`);
    
    return Buffer.from(limitedPdfBytes);
    
  } catch (error) {
    console.error('Failed to limit PDF pages or add watermarks:', error);
    // If watermarking fails, still try to limit pages
    try {
      const PDFLib = await import('pdf-lib');
      const { PDFDocument } = PDFLib;
      
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const totalPages = pdfDoc.getPageCount();
      
      if (totalPages <= maxPages) {
        return pdfBuffer;
      }
      
      const newPdfDoc = await PDFDocument.create();
      const pagesToCopy = Array.from({ length: maxPages }, (_, i) => i);
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToCopy);
      
      copiedPages.forEach((page) => {
        newPdfDoc.addPage(page);
      });
      
      const limitedPdfBytes = await newPdfDoc.save();
      return Buffer.from(limitedPdfBytes);
    } catch (fallbackError) {
      console.error('Fallback page limiting also failed:', fallbackError);
      return pdfBuffer;
    }
  }
}

function prepareTemplateDataWithWatermark(contract: any, user: any) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getUserFirstName = () => {
    if (contract.userFirstName) return contract.userFirstName;
    if (contract.userFullName) return contract.userFullName.split(' ')[0];
    return '[Your First Name]';
  };

  const getPartnerFirstName = () => {
    if (contract.partnerFirstName) return contract.partnerFirstName;
    if (contract.partnerFullName) return contract.partnerFullName.split(' ')[0];
    return '[Partner First Name]';
  };

  return {
    // Core party information (clean data, watermarks added visually to PDF)
    userFullName: contract.userFullName || '[Your Name]',
    partnerFullName: contract.partnerFullName || '[Partner Name]',
    userFirstName: getUserFirstName(),
    partnerFirstName: getPartnerFirstName(),
    
    // Employment and income
    userJobTitle: contract.userJobTitle || '[Your Occupation]',
    partnerJobTitle: contract.partnerJobTitle || '[Partner Occupation]',
    userIncome: contract.userIncome ? `$${parseInt(contract.userIncome).toLocaleString()} CAD` : '[Your Income]',
    partnerIncome: contract.partnerIncome ? `$${parseInt(contract.partnerIncome).toLocaleString()} CAD` : '[Partner Income]',
    
    // Contact information
    userEmail: contract.userEmail || user.email || '[Your Email]',
    partnerEmail: contract.partnerEmail || '[Partner Email]',
    userPhone: contract.userPhone || '[Your Phone]',
    partnerPhone: contract.partnerPhone || '[Partner Phone]',
    userAddress: contract.userAddress || '[Your Address]',
    partnerAddress: contract.partnerAddress || '[Partner Address]',
    
    // Pronouns
    userPronouns: contract.userPronouns || '[Your Pronouns]',
    partnerPronouns: contract.partnerPronouns || '[Partner Pronouns]',
    
    // Residence
    residenceAddress: contract.residenceAddress || '[Residence Address]',
    
    // Dynamic residence content based on ownership type
    ...generateResidenceContent(contract),
    
    // Dates
    currentDate: currentDate,
    contractDate: currentDate,
    cohabDate: contract.cohabDate ? new Date(contract.cohabDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : currentDate,
    proposedMarriageDate: contract.proposedMarriageDate ? new Date(contract.proposedMarriageDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : '',
    
    // Conditional logic fields (based on actual field values)
    proposed_marriage_date: contract.proposedMarriageDate ? new Date(contract.proposedMarriageDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : null,
    cohab_date: contract.cohabDate ? new Date(contract.cohabDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : null,
    user_lawyer: contract.userLawyer || null,
    partner_lawyer: contract.partnerLawyer || null,
    residence_address: contract.residenceAddress || null,
    additional_clauses: contract.additionalClauses || null,
    
    // Pronoun conditionals for user
    user_is_she: contract.userPronouns === 'she/her/hers' ? 'she' : null,
    user_is_he: contract.userPronouns === 'he/him/his' ? 'he' : null,
    user_is_they: contract.userPronouns === 'they/them/theirs' ? 'they' : null,
    user_her: contract.userPronouns === 'she/her/hers' ? 'her' : null,
    user_his: contract.userPronouns === 'he/him/his' ? 'his' : null,
    user_their: contract.userPronouns === 'they/them/theirs' ? 'their' : null,
    user_hers: contract.userPronouns === 'she/her/hers' ? 'hers' : null,
    user_theirs: contract.userPronouns === 'they/them/theirs' ? 'theirs' : null,
    
    // Pronoun conditionals for partner
    partner_is_she: contract.partnerPronouns === 'she/her/hers' ? 'she' : null,
    partner_is_he: contract.partnerPronouns === 'he/him/his' ? 'he' : null,
    partner_is_they: contract.partnerPronouns === 'they/them/theirs' ? 'they' : null,
    partner_her: contract.partnerPronouns === 'she/her/hers' ? 'her' : null,
    partner_his: contract.partnerPronouns === 'he/him/his' ? 'his' : null,
    partner_their: contract.partnerPronouns === 'they/them/theirs' ? 'their' : null,
    partner_hers: contract.partnerPronouns === 'she/her/hers' ? 'hers' : null,
    partner_theirs: contract.partnerPronouns === 'they/them/theirs' ? 'theirs' : null,
    
    // Ages - using correct field names
    userAge: contract.user_age || contract.userAge || '[Your Age]',
    partnerAge: contract.partner_age || contract.partnerAge || '[Partner Age]', 
    
    // Legal counsel
    userLawyer: contract.userLawyer || '[Your Legal Counsel]',
    partnerLawyer: contract.partnerLawyer || '[Partner Legal Counsel]',
    
    // Location
    province: 'Alberta',
    country: 'Canada',
    
    // Children information
    hasChildren: contract.children && contract.children.length > 0,
    childrenCount: contract.children ? contract.children.length : 0,
    childrenList: contract.children || [],
    childrenStatus: (contract.children && contract.children.length > 0) ? 
      `The parties have ${contract.children.length} child${contract.children.length > 1 ? 'ren' : ''} of the relationship: ${contract.children.map((child: any) => {
        const childInfo = child.name;
        if (child.birthdate) {
          const birthDate = new Date(child.birthdate);
          const birthYear = birthDate.getFullYear();
          const birthMonth = birthDate.toLocaleDateString('en-US', { month: 'long' });
          const birthDay = birthDate.getDate();
          return `${childInfo} (born ${birthMonth} ${birthDay}, ${birthYear})`;
        }
        return childInfo;
      }).join(', ')}.` : 
      'There are no children of the relationship as of the Effective Date of this Agreement. The parties may or may not have children together in the future, either biological or adopted.',
    
    // Additional clauses (clean data, watermarks added visually to PDF)
    additionalClauses: contract.additionalClauses || '',
    notes: contract.notes || '',
    
    // Schedule A data - format for display
    scheduleIncomeEmployment: contract.scheduleIncomeEmployment ? `$${parseFloat(contract.scheduleIncomeEmployment).toLocaleString()} CAD` : '',
    scheduleIncomeEI: contract.scheduleIncomeEI ? `$${parseFloat(contract.scheduleIncomeEI).toLocaleString()} CAD` : '',
    scheduleIncomeWorkersComp: contract.scheduleIncomeWorkersComp ? `$${parseFloat(contract.scheduleIncomeWorkersComp).toLocaleString()} CAD` : '',
    scheduleIncomeInvestment: contract.scheduleIncomeInvestment ? `$${parseFloat(contract.scheduleIncomeInvestment).toLocaleString()} CAD` : '',
    scheduleIncomePension: contract.scheduleIncomePension ? `$${parseFloat(contract.scheduleIncomePension).toLocaleString()} CAD` : '',
    scheduleIncomeGovernmentAssistance: contract.scheduleIncomeGovernmentAssistance ? `$${parseFloat(contract.scheduleIncomeGovernmentAssistance).toLocaleString()} CAD` : '',
    scheduleIncomeSelfEmployment: contract.scheduleIncomeSelfEmployment ? `$${parseFloat(contract.scheduleIncomeSelfEmployment).toLocaleString()} CAD` : '',
    scheduleIncomeOther: contract.scheduleIncomeOther ? `$${parseFloat(contract.scheduleIncomeOther).toLocaleString()} CAD` : '',
    scheduleIncomeTotalTaxReturn: contract.scheduleIncomeTotalTaxReturn ? `$${parseFloat(contract.scheduleIncomeTotalTaxReturn).toLocaleString()} CAD` : '',
    
    // Schedule A assets and debts (these will be arrays, can be processed in template)
    scheduleAssetsRealEstate: contract.scheduleAssetsRealEstate || [],
    scheduleAssetsVehicles: contract.scheduleAssetsVehicles || [],
    scheduleAssetsFinancial: contract.scheduleAssetsFinancial || [],
    scheduleAssetsPensions: contract.scheduleAssetsPensions || [],
    scheduleAssetsBusiness: contract.scheduleAssetsBusiness || [],
    scheduleAssetsOther: contract.scheduleAssetsOther || [],
    scheduleDebtsSecured: contract.scheduleDebtsSecured || [],
    scheduleDebtsUnsecured: contract.scheduleDebtsUnsecured || [],
    scheduleDebtsOther: contract.scheduleDebtsOther || [],
  };
}