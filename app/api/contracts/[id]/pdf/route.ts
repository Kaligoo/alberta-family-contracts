import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts, templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { generateResidenceContent } from '@/lib/content/residence-content';
const convertapi = require('convertapi');
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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

    // Generate PDF using Word template + Puppeteer
    const pdfBytes = await generateContractPDFFromTemplate(contract, user);
    
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

async function generateContractPDFFromTemplate(contract: any, user: any): Promise<Uint8Array> {
  try {
    console.log('Starting PDF generation using direct Word to PDF conversion...');
    
    // Get active template from database
    const activeTemplate = await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, 'true'))
      .limit(1);

    if (activeTemplate.length === 0) {
      console.log('No active template found, falling back to basic PDF generation');
      return await generateBasicPDF(contract, user);
    }

    const template = activeTemplate[0];
    const templateData = prepareTemplateData(contract, user);
    
    // Generate filled Word document
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
    
    // Use ConvertAPI to convert Word document directly to PDF (preserves all formatting)
    console.log('Converting Word document to PDF using ConvertAPI...');
    
    // Initialize ConvertAPI (you'll need to set CONVERTAPI_SECRET environment variable)
    if (!process.env.CONVERTAPI_SECRET) {
      console.log('CONVERTAPI_SECRET not configured, falling back to basic PDF generation...');
      return await generateBasicPDF(contract, user);
    }
    
    const convertApiClient = convertapi(process.env.CONVERTAPI_SECRET);
    
    // Convert DOCX buffer to PDF using ConvertAPI
    const result = await convertApiClient.convert('pdf', {
      File: filledDocxBuffer
    }, 'docx');
    
    // Get the PDF buffer from the first result file
    const pdfBuffer = await result.file.save();
    
    console.log('Successfully generated PDF using direct Word to PDF conversion');
    return new Uint8Array(pdfBuffer);
    
  } catch (error) {
    console.error('Failed to generate PDF using ConvertAPI:', error);
    console.log('Falling back to basic PDF generation...');
    return await generateBasicPDF(contract, user);
  }
}

async function generateBasicPDF(contract: any, user: any): Promise<Uint8Array> {
  let browser;
  
  try {
    const templateData = prepareTemplateData(contract, user);
    
    // Create basic HTML template
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Alberta Cohabitation Agreement</title>
      <style>
        @page {
          size: A4;
          margin: 1in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          margin: 0;
          padding: 0;
        }
        h1 {
          font-size: 16pt;
          text-align: center;
          margin-bottom: 30px;
          font-weight: bold;
        }
        h2 {
          font-size: 14pt;
          margin-top: 20px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        p {
          margin-bottom: 8px;
        }
        .section {
          margin-bottom: 20px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #000;
          font-size: 10pt;
        }
      </style>
    </head>
    <body>
      <h1>ALBERTA COHABITATION AGREEMENT</h1>
      
      <div class="section">
        <h2>PARTIES TO THIS AGREEMENT</h2>
        <p><strong>Party A:</strong> ${templateData.userFullName}</p>
        ${contract.userAddress ? `<p>Address: ${contract.userAddress}</p>` : ''}
        ${contract.userEmail ? `<p>Email: ${contract.userEmail}</p>` : ''}
        ${contract.userPhone ? `<p>Phone: ${contract.userPhone}</p>` : ''}
        
        <br>
        <p><strong>Party B:</strong> ${templateData.partnerFullName}</p>
        ${contract.partnerAddress ? `<p>Address: ${contract.partnerAddress}</p>` : ''}
        ${contract.partnerEmail ? `<p>Email: ${contract.partnerEmail}</p>` : ''}
        ${contract.partnerPhone ? `<p>Phone: ${contract.partnerPhone}</p>` : ''}
      </div>
      
      <div class="section">
        <h2>AGREEMENT DETAILS</h2>
        <p>Date of Agreement: ${templateData.currentDate}</p>
        ${contract.cohabDate ? `<p>Date Cohabitation Began: ${templateData.cohabDate}</p>` : ''}
        ${contract.residenceAddress ? `<p>Residence Address: ${contract.residenceAddress}</p>` : ''}
      </div>
      
      ${(contract.userIncome || contract.partnerIncome) ? `
      <div class="section">
        <h2>FINANCIAL INFORMATION</h2>
        ${contract.userIncome ? `<p>Party A Annual Income: ${templateData.userIncome}</p>` : ''}
        ${contract.partnerIncome ? `<p>Party B Annual Income: ${templateData.partnerIncome}</p>` : ''}
      </div>
      ` : ''}
      
      ${(contract.userJobTitle || contract.partnerJobTitle) ? `
      <div class="section">
        <h2>EMPLOYMENT INFORMATION</h2>
        ${contract.userJobTitle ? `<p>Party A Occupation: ${contract.userJobTitle}</p>` : ''}
        ${contract.partnerJobTitle ? `<p>Party B Occupation: ${contract.partnerJobTitle}</p>` : ''}
      </div>
      ` : ''}
      
      ${(contract.children && contract.children.length > 0) ? `
      <div class="section">
        <h2>CHILDREN</h2>
        ${contract.children.map((child: any, index: number) => {
          let childInfo = `<p>Child ${index + 1}: ${child.name}`;
          if (child.birthdate) {
            const birthDate = new Date(child.birthdate);
            const birthYear = birthDate.getFullYear();
            const birthMonth = birthDate.toLocaleDateString('en-US', { month: 'long' });
            const birthDay = birthDate.getDate();
            childInfo += ` (born ${birthMonth} ${birthDay}, ${birthYear})`;
          }
          childInfo += `</p>`;
          return childInfo;
        }).join('')}
      </div>
      ` : ''}
      
      ${contract.additionalClauses ? `
      <div class="section">
        <h2>ADDITIONAL CLAUSES</h2>
        <p>${contract.additionalClauses}</p>
      </div>
      ` : ''}
      
      ${contract.notes ? `
      <div class="section">
        <h2>NOTES</h2>
        <p>${contract.notes}</p>
      </div>
      ` : ''}
      
      <div class="footer">
        <p><strong>IMPORTANT NOTICE</strong></p>
        <p>This document is a draft cohabitation agreement generated for informational purposes only. It should be reviewed by qualified legal counsel before signing. Alberta Family Contracts does not provide legal advice.</p>
        <br>
        <p>Generated on: ${templateData.currentDate}</p>
        <p>Contract ID: #${contract.id}</p>
      </div>
    </body>
    </html>
    `;
    
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: null,
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1in',
        right: '1in',
        bottom: '1in',
        left: '1in'
      }
    });
    
    console.log('Successfully generated basic PDF using Puppeteer');
    return new Uint8Array(pdfBuffer);
    
  } catch (error) {
    console.error('Failed to generate basic PDF using Puppeteer:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
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