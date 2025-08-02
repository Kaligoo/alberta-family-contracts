import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts, templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { generateResidenceContent } from '@/lib/content/residence-content';
import { updatePdfProgress } from '@/lib/utils/pdf-progress';

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

    // Initialize progress tracking
    updatePdfProgress(contractId, 10, 'Initializing PDF generation...');

    // Generate PDF using Gotenberg (Word-to-PDF conversion)
    const pdfBytes = await generateContractPDFWithGotenberg(contract, user, contractId);
    
    // Mark as completed
    updatePdfProgress(contractId, 100, 'PDF generation completed!');
    
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

async function generateContractPDFWithGotenberg(contract: any, user: any, contractId?: number): Promise<Uint8Array> {
  try {
    console.log('Starting PDF v2 generation using Gotenberg Word-to-PDF conversion...');
    
    if (contractId) updatePdfProgress(contractId, 20, 'Loading document template...');
    
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
    
    if (contractId) updatePdfProgress(contractId, 35, 'Preparing contract data...');
    
    const templateData = prepareTemplateData(contract, user);
    
    // Debug template data
    console.log('Template data prepared:', {
      proposedMarriageDate: templateData.proposedMarriageDate,
      contractType: templateData.contractType,
      userFullName: templateData.userFullName,
      cohabDate: templateData.cohabDate,
      proposed_marriage_date: templateData.proposed_marriage_date,
      cohab_date: templateData.cohab_date
    });
    
    console.log('Template conditional syntax guide:');
    console.log('Use: {#proposed_marriage_date}...{/proposed_marriage_date}');
    console.log('Available conditional fields: proposed_marriage_date, cohab_date, user_lawyer, partner_lawyer');
    
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

    try {
      if (contractId) updatePdfProgress(contractId, 50, 'Filling contract template...');
      
      doc.render(templateData);
      console.log('Successfully rendered template with data');
      
      if (contractId) updatePdfProgress(contractId, 65, 'Generating Word document...');
    } catch (renderError) {
      console.error('Template rendering error:', renderError);
      console.error('Template data keys:', Object.keys(templateData));
      console.error('Render error details:', {
        message: renderError instanceof Error ? renderError.message : 'Unknown error',
        name: renderError instanceof Error ? renderError.name : 'Unknown',
        stack: renderError instanceof Error ? renderError.stack : 'No stack trace'
      });
      throw new Error(`Template rendering failed: ${renderError instanceof Error ? renderError.message : 'Unknown error'}`);
    }
    
    const filledDocxBuffer = doc.getZip().generate({ type: 'nodebuffer' });
    
    // Convert Word document to PDF using Gotenberg
    console.log('Starting Gotenberg conversion...');
    const pdfBuffer = await convertWordToPDFWithGotenberg(filledDocxBuffer, contractId);
    console.log('Gotenberg conversion completed successfully');
    
    if (contractId) updatePdfProgress(contractId, 95, 'Finalizing PDF...');
    
    console.log('Successfully generated PDF v2 using Gotenberg Word-to-PDF conversion');
    return new Uint8Array(pdfBuffer);
    
  } catch (error) {
    console.error('Failed to generate PDF v2 using Gotenberg:', error);
    throw error;
  }
}

async function convertWordToPDFWithGotenberg(docxBuffer: Buffer, contractId?: number): Promise<Buffer> {
  // Use production Gotenberg service by default, fallback to localhost for development
  const GOTENBERG_URL = process.env.GOTENBERG_URL || 'https://gotenberg-service-162295646145.us-central1.run.app';
  
  try {
    console.log('Converting Word document to PDF using Gotenberg LibreOffice conversion...');
    
    if (contractId) updatePdfProgress(contractId, 80, 'Converting to PDF...');
    
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
    
    // Boolean flags for conditional logic in templates (based on actual field values)
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
    user_is_she: contract.userPronouns === 'she/her/hers',
    user_is_he: contract.userPronouns === 'he/him/his',
    user_is_they: contract.userPronouns === 'they/them/theirs',
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