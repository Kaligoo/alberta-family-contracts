import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts, templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import puppeteer from 'puppeteer';
import mammoth from 'mammoth';

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

    // Generate PDF using Puppeteer HTML-to-PDF conversion
    const pdfBytes = await generateContractPDF(contract, user, userWithTeam.teamId);
    
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

async function generateContractPDF(contract: any, user: any, teamId: number): Promise<Uint8Array> {
  try {
    // First, try to generate PDF from Word document using Puppeteer
    const wordBuffer = await generateWordDocument(contract, user, teamId);
    
    // Convert Word document to HTML using mammoth
    const result = await mammoth.convertToHtml({ buffer: wordBuffer });
    const htmlContent = result.value;
    
    // Create professional HTML with proper styling
    const styledHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            margin: 1in;
            size: A4;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 0;
          }
          h1, h2, h3, h4, h5, h6 {
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
          }
          h1 {
            font-size: 16pt;
            text-align: center;
            text-transform: uppercase;
          }
          h2 {
            font-size: 14pt;
            text-transform: uppercase;
          }
          h3 {
            font-size: 13pt;
          }
          p {
            margin-bottom: 10px;
            text-align: justify;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .signature-section {
            margin-top: 40px;
            page-break-inside: avoid;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            width: 300px;
            margin: 20px 0 5px 0;
            display: inline-block;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 10px 0;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .page-break {
            page-break-before: always;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setContent(styledHtml, { waitUntil: 'networkidle0' });
    
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
    
    await browser.close();
    
    console.log('Successfully generated PDF using Puppeteer');
    return new Uint8Array(pdfBuffer);
    
  } catch (error) {
    console.warn('Failed to generate PDF using Puppeteer, falling back to pdf-lib:', error);
    // Fallback to pdf-lib if Puppeteer conversion fails
    return await generateFallbackPDF(contract, user);
  }
}

async function generateWordDocument(contract: any, user: any, teamId: number): Promise<Buffer> {
  // Get active template from database (same logic as generate-professional route)
  const activeTemplate = await db
    .select()
    .from(templates)
    .where(eq(templates.isActive, 'true'))
    .limit(1);

  if (activeTemplate.length === 0) {
    throw new Error('No active template found');
  }

  const template = activeTemplate[0];

  // Prepare template data (same as generate-professional route)
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
  return buffer;
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
    
    // Dates
    currentDate: currentDate,
    contractDate: currentDate,
    weddingDate: '', // Not applicable for cohabitation
    cohabDate: contract.cohabDate ? new Date(contract.cohabDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : currentDate,
    
    // Ages
    userAge: contract.userAge || '[Your Age]',
    partnerAge: contract.partnerAge || '[Partner Age]', 
    
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
      'The parties have children as detailed in this agreement.' : 
      'There are no children of the relationship as of the Effective Date of this Agreement. The parties may or may not have children together in the future, either biological or adopted.',
    waiverSpousalSupport: contract.waiverSpousalSupport || false,
    
    // Additional clauses
    additionalClauses: contract.additionalClauses || '',
    notes: contract.notes || ''
  };
}

// Fallback PDF generation using pdf-lib (simplified version)
async function generateFallbackPDF(contract: any, user: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.276, 841.890]); // A4 size in points
  
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - margin;
  
  // Helper function to add text
  const addText = (text: string, fontSize: number = 12, isBold = false) => {
    const font = isBold ? helveticaBoldFont : helveticaFont;
    page.drawText(text, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    yPosition -= fontSize + 8;
  };
  
  // Simplified PDF content
  addText('ALBERTA COHABITATION AGREEMENT', 20, true);
  yPosition -= 30;
  
  addText('SIMPLIFIED PDF VERSION', 16, true);
  addText('This PDF was generated using the simplified fallback method.', 12);
  addText('The system was unable to generate the full formatted version.', 12);
  yPosition -= 20;
  
  addText(`Party A: ${contract.userFullName || '[Your Name]'}`, 12);
  addText(`Party B: ${contract.partnerFullName || '[Partner Name]'}`, 12);
  yPosition -= 20;
  
  const currentDate = new Date().toLocaleDateString('en-CA');
  addText(`Generated on: ${currentDate}`, 10);
  addText(`Contract ID: #${contract.id}`, 10);
  yPosition -= 30;
  
  addText('NOTICE: For full formatting, please download the Word version.', 10, true);
  
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}