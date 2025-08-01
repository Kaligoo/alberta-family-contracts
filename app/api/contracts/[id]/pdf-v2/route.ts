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

    // Generate PDF using Gotenberg (Word-to-PDF conversion)
    const pdfBytes = await generateContractPDFWithGotenberg(contract, user);
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="cohabitation-agreement-v2-${contractId}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF v2:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF v2' },
      { status: 500 }
    );
  }
}

async function generateContractPDFWithGotenberg(contract: any, user: any): Promise<Uint8Array> {
  try {
    console.log('Starting PDF v2 generation using Gotenberg Word-to-PDF conversion...');
    
    // Get active template from database
    const activeTemplate = await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, 'true'))
      .limit(1);

    if (activeTemplate.length === 0) {
      throw new Error('No active template found for PDF v2 generation');
    }

    const template = activeTemplate[0];
    const templateData = prepareTemplateData(contract, user);
    
    // Generate filled Word document (same as PDF v1)
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
    const filledDocxBuffer = doc.getZip().generate({ type: 'nodebuffer' });
    
    // Convert Word document to PDF using Gotenberg
    const pdfBuffer = await convertWordToPDFWithGotenberg(filledDocxBuffer);
    
    console.log('Successfully generated PDF v2 using Gotenberg Word-to-PDF conversion');
    return new Uint8Array(pdfBuffer);
    
  } catch (error) {
    console.error('Failed to generate PDF v2 using Gotenberg:', error);
    throw error;
  }
}

async function convertWordToPDFWithGotenberg(docxBuffer: Buffer): Promise<Buffer> {
  // Use production Gotenberg service by default, fallback to localhost for development
  const GOTENBERG_URL = process.env.GOTENBERG_URL || 'https://gotenberg-service-162295646145.us-central1.run.app';
  
  try {
    console.log('Converting Word document to PDF using Gotenberg LibreOffice conversion...');
    
    // Create form data for Gotenberg LibreOffice conversion
    const formData = new FormData();
    
    // Add the Word document file
    const docxBlob = new Blob([docxBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    formData.append('files', docxBlob, 'contract.docx');
    
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
    console.log('Successfully converted Word document to PDF using Gotenberg');
    return Buffer.from(arrayBuffer);
    
  } catch (error) {
    // If Gotenberg is not available, throw a more helpful error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Gotenberg service not available at ${GOTENBERG_URL}. Please start Gotenberg with: docker run --rm -p 3000:3000 gotenberg/gotenberg:8`);
    }
    throw error;
  }
}


function prepareTemplateData(contract: any, user: any) {
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
    // Core party information
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
    
    // Boolean flags for conditional logic in templates
    hasProposedMarriageDate: !!(contract.proposedMarriageDate),
    hasCohabDate: !!(contract.cohabDate),
    hasUserLawyer: !!(contract.userLawyer),
    hasPartnerLawyer: !!(contract.partnerLawyer),
    hasResidenceAddress: !!(contract.residenceAddress),
    hasAdditionalClauses: !!(contract.additionalClauses),
    
    // Contract type flags for conditional logic
    isCohabitation: (contract.contractType === 'cohabitation'),
    isPrenuptial: (contract.contractType === 'prenuptial'), 
    isPostnuptial: (contract.contractType === 'postnuptial'),
    contractType: contract.contractType || 'cohabitation',
    
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
    
    // Additional clauses
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