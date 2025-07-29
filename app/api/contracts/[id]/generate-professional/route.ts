import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts, templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { generateResidenceContent } from '@/lib/content/residence-content';

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

export async function POST(
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

    // Get the contract
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

    // Get active template from database
    const activeTemplate = await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, 'true'))
      .limit(1);

    if (activeTemplate.length === 0) {
      return NextResponse.json({ 
        error: 'No active template found. Please upload and activate a template first.' 
      }, { status: 500 });
    }

    const template = activeTemplate[0];

    // Prepare template data
    const templateData = prepareTemplateData(contract, user);
    
    // Generate document from database-stored template
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
    
    const buffer = doc.getZip().generate({ type: 'nodebuffer' });
    
    // Return the document as a download
    const filename = `cohabitation-agreement-${contract.userFullName?.replace(/\s+/g, '-') || 'contract'}-${contractId}.docx`;
    
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('Error generating professional document:', error);
    
    // Handle docxtemplater-specific errors
    if (error?.properties && error?.properties?.errors) {
      console.error('Template errors:');
      error.properties.errors.forEach((err: any) => {
        console.error(`  - ${err.message} at line ${err.line}`);
      });
      
      return NextResponse.json({
        error: 'Template processing error',
        details: error.properties.errors.map((err: any) => err.message)
      }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: 'Failed to generate professional document' },
      { status: 500 }
    );
  }
}

function prepareTemplateData(contract: any, user: any) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Extract first names from full names if not provided separately
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
    
    // Residence
    residenceAddress: contract.residenceAddress || '[Residence Address]',
    
    // Dynamic residence content based on ownership type
    ...generateResidenceContent(contract),
    
    // Dates
    currentDate: currentDate,
    contractDate: currentDate,
    weddingDate: '', // Not applicable for cohabitation
    cohabDate: contract.cohabDate ? new Date(contract.cohabDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : currentDate,
    
    // Ages - using correct field names
    userAge: contract.user_age || contract.userAge || '[Your Age]',
    partnerAge: contract.partner_age || contract.partnerAge || '[Partner Age]', 
    
    // Legal counsel (placeholder - could be made configurable)
    userLawyer: contract.userLawyer || '[Your Legal Counsel]',
    partnerLawyer: contract.partnerLawyer || '[Partner Legal Counsel]',
    
    // Property/financial values
    value: contract.propertyValue || '[Property Value]',
    
    // Location
    province: 'Alberta',
    country: 'Canada',
    
    // Conditional sections
    hasChildren: contract.children && contract.children.length > 0,
    childrenCount: contract.children ? contract.children.length : 0,
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
    waiverSpousalSupport: contract.waiverSpousalSupport || false,
    
    // Additional clauses
    additionalClauses: contract.additionalClauses || '',
    notes: contract.notes || ''
  };
}