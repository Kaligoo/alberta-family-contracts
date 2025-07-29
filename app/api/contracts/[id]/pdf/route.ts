import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts, templates } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import mammoth from 'mammoth';

const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

// Function to enhance Word formatting in HTML
function enhanceWordFormatting(html: string): string {
  let enhancedHtml = html;
  
  // Convert common patterns that indicate titles/headings
  enhancedHtml = enhancedHtml.replace(
    /<p><strong>([^<]*(?:AGREEMENT|CONTRACT|COHABITATION|SCHEDULE)[^<]*)<\/strong><\/p>/gi,
    '<h1 class="document-title">$1</h1>'
  );
  
  // Convert section headings (typically all caps paragraphs)
  enhancedHtml = enhancedHtml.replace(
    /<p><strong>([A-Z][A-Z\s]{10,})<\/strong><\/p>/g,
    '<h2 class="section-heading">$1</h2>'
  );
  
  // Convert numbered sections like "1. DEFINITIONS"
  enhancedHtml = enhancedHtml.replace(
    /<p><strong>(\d+\.\s*[A-Z][A-Z\s]+)<\/strong><\/p>/g,
    '<h2 class="section-heading">$1</h2>'
  );
  
  // Convert subsection headings like "(a) Something"
  enhancedHtml = enhancedHtml.replace(
    /<p><strong>\(([a-z])\)\s*([^<]+)<\/strong><\/p>/g,
    '<h3 class="subsection-heading">($1) $2</h3>'
  );
  
  // Convert WHEREAS clauses
  enhancedHtml = enhancedHtml.replace(
    /<p>(\s*WHEREAS\s+[^<]+)<\/p>/gi,
    '<p class="whereas-clause">$1</p>'
  );
  
  // Convert NOW THEREFORE clauses
  enhancedHtml = enhancedHtml.replace(
    /<p>(\s*NOW\s+THEREFORE[^<]*)<\/p>/gi,
    '<p class="now-therefore">$1</p>'
  );
  
  // Convert signature lines (lines with underscores or similar)
  enhancedHtml = enhancedHtml.replace(
    /<p>([^<]*(?:signature|sign|date)[^<]*_{5,}[^<]*)<\/p>/gi,
    '<p class="signature-line">$1</p>'
  );
  
  // Convert witness lines
  enhancedHtml = enhancedHtml.replace(
    /<p>([^<]*witness[^<]*_{5,}[^<]*)<\/p>/gi,
    '<p class="witness-line">$1</p>'
  );
  
  // Enhance party information (typically starts with name or "Party A"/"Party B")
  enhancedHtml = enhancedHtml.replace(
    /<p><strong>(Party [AB]:[^<]+)<\/strong><\/p>/g,
    '<p class="party-info"><strong>$1</strong></p>'
  );
  
  // Convert tabular data to actual tables if detected
  const tablePattern = /<p>([^<]*\t[^<]*\t[^<]*)<\/p>/g;
  if (tablePattern.test(enhancedHtml)) {
    enhancedHtml = enhancedHtml.replace(tablePattern, (match, content) => {
      const cells = content.split('\t').map((cell: string) => `<td>${cell.trim()}</td>`).join('');
      return `<table><tr>${cells}</tr></table>`;
    });
  }
  
  // Add spacing for legal clauses (paragraphs that start with numbers)
  enhancedHtml = enhancedHtml.replace(
    /<p>(\d+\.\d*\s+[^<]+)<\/p>/g,
    '<p class="clause">$1</p>'
  );
  
  // Add spacing for sub-clauses (paragraphs that start with letters in parentheses)
  enhancedHtml = enhancedHtml.replace(
    /<p>(\s*\([a-z]\)\s+[^<]+)<\/p>/g,
    '<p class="sub-clause">$1</p>'
  );
  
  // Preserve line breaks and spacing from Word
  enhancedHtml = enhancedHtml.replace(/\n\s*\n/g, '<br><br>');
  
  // Clean up multiple consecutive paragraphs with just spacing
  enhancedHtml = enhancedHtml.replace(/<p>\s*<\/p>/g, '<br>');
  
  return enhancedHtml;
}

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
  let browser;
  
  try {
    console.log('Starting PDF generation using Word template + Puppeteer...');
    
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
    
    // Convert Word document to HTML with enhanced style mapping
    console.log('Converting Word document to HTML with style mapping...');
    const result = await mammoth.convertToHtml({ 
      buffer: filledDocxBuffer 
    }, {
      styleMap: [
        // Headings and titles
        "p[style-name='Title'] => h1.document-title",
        "p[style-name='Heading 1'] => h1.section-heading",
        "p[style-name='Heading 2'] => h2.subsection-heading", 
        "p[style-name='Heading 3'] => h3.minor-heading",
        
        // Paragraph styles
        "p[style-name='Normal'] => p.normal-text",
        "p[style-name='Body Text'] => p.body-text",
        "p[style-name='Body Text Indent'] => p.body-text-indent",
        "p[style-name='Body Text First Indent'] => p.body-text-first-indent",
        
        // Lists and numbering
        "p[style-name='List Paragraph'] => li.list-item",
        "p[style-name='List Number'] => li.numbered-item",
        "p[style-name='List Bullet'] => li.bullet-item",
        
        // Legal document specific
        "p[style-name='Signature'] => p.signature-line",
        "p[style-name='Witness'] => p.witness-line",
        "p[style-name='Date'] => p.date-line",
        "p[style-name='Party A'] => p.party-a",
        "p[style-name='Party B'] => p.party-b",
        
        // Character styles
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
        "r[style-name='Underline'] => u",
        
        // Default mappings
        "p => p",
        "b => strong",
        "i => em",
        "u => u"
      ],
      includeDefaultStyleMap: true,
      includeEmbeddedStyleMap: true
    });
    const html = result.value;
    
    if (result.messages.length > 0) {
      console.log('Mammoth conversion warnings:', result.messages);
    }
    
    // Post-process HTML to enhance formatting
    const enhancedHtml = enhanceWordFormatting(html);
    
    // Create styled HTML for PDF generation with enhanced legal document formatting
    const styledHtml = `
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
        
        /* Base document styling */
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 0;
          text-align: justify;
        }
        
        /* Document title styling */
        h1.document-title {
          font-size: 16pt;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          margin: 0 0 30px 0;
          letter-spacing: 1px;
        }
        
        /* Section headings */
        h1.section-heading {
          font-size: 14pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 30px 0 15px 0;
          text-align: center;
        }
        
        h2.subsection-heading {
          font-size: 12pt;
          font-weight: bold;
          margin: 20px 0 10px 0;
          text-align: left;
        }
        
        h3.minor-heading {
          font-size: 12pt;
          font-weight: bold;
          margin: 15px 0 8px 0;
          text-decoration: underline;
        }
        
        /* Default headings fallback */
        h1 {
          font-size: 14pt;
          font-weight: bold;
          margin: 20px 0 15px 0;
          text-align: center;
        }
        
        h2 {
          font-size: 12pt;
          font-weight: bold;
          margin: 15px 0 10px 0;
        }
        
        h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 10px 0 8px 0;
        }
        
        /* Paragraph styles */
        p {
          margin: 0 0 12px 0;
          text-align: justify;
          line-height: 1.5;
        }
        
        p.normal-text {
          margin: 0 0 12px 0;
        }
        
        p.body-text {
          margin: 0 0 12px 0;
          text-indent: 0;
        }
        
        p.body-text-indent {
          margin: 0 0 12px 0;
          text-indent: 0.5in;
        }
        
        p.body-text-first-indent {
          margin: 0 0 12px 0;
          text-indent: 0.5in;
        }
        
        /* Party information */
        p.party-a, p.party-b, p.party-info {
          margin: 15px 0;
          font-weight: bold;
        }
        
        /* Legal document elements */
        p.signature-line {
          margin: 30px 0 10px 0;
          border-bottom: 1px solid #000;
          min-height: 20px;
          display: inline-block;
          width: 300px;
        }
        
        p.witness-line {
          margin: 20px 0 10px 0;
          border-bottom: 1px solid #000;
          min-height: 20px;
          display: inline-block;
          width: 250px;
        }
        
        p.date-line {
          margin: 10px 0;
          font-style: italic;
        }
        
        /* Text formatting */
        strong, b {
          font-weight: bold;
        }
        
        em, i {
          font-style: italic;
        }
        
        u {
          text-decoration: underline;
        }
        
        /* Lists */
        ul, ol {
          margin: 12px 0;
          padding-left: 40px;
        }
        
        li {
          margin: 6px 0;
          line-height: 1.5;
        }
        
        li.list-item {
          margin: 8px 0;
        }
        
        li.numbered-item {
          margin: 8px 0;
        }
        
        li.bullet-item {
          margin: 8px 0;
        }
        
        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 11pt;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        
        /* Sections and spacing */
        .section {
          margin-bottom: 25px;
        }
        
        /* Legal clauses numbering */
        .clause {
          margin: 15px 0;
          counter-increment: clause-counter;
        }
        
        .clause::before {
          content: counter(clause-counter) ". ";
          font-weight: bold;
        }
        
        /* Indentation for sub-clauses */
        .sub-clause {
          margin-left: 30px;
          margin: 10px 0 10px 30px;
        }
        
        /* Schedule and appendix formatting */
        .schedule {
          margin-top: 40px;
          page-break-before: auto;
        }
        
        .schedule-title {
          font-size: 14pt;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          margin: 0 0 20px 0;
        }
        
        /* Footer styling */
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #000;
          font-size: 10pt;
          page-break-inside: avoid;
        }
        
        /* Print optimization */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .no-break {
            page-break-inside: avoid;
          }
        }
        
        /* Preserve Word document spacing */
        br {
          line-height: 1.5;
        }
        
        /* Handle Word's paragraph spacing */
        p + p {
          margin-top: 0;
        }
        
        /* Legal document specific spacing */
        .whereas-clause {
          margin: 15px 0;
          text-indent: 50px;
        }
        
        .whereas-clause::before {
          content: "WHEREAS ";
          font-weight: bold;
          text-indent: 0;
          margin-left: -50px;
        }
        
        .now-therefore {
          margin: 25px 0 15px 0;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      ${enhancedHtml}
      <div class="footer">
        <p><strong>IMPORTANT NOTICE</strong></p>
        <p style="font-size: 10pt; text-align: justify;">
          This document is a draft cohabitation agreement generated for informational purposes only. 
          It should be reviewed by qualified legal counsel before signing. Alberta Family Contracts 
          does not provide legal advice.
        </p>
        <br>
        <p style="font-size: 10pt;">Generated on: ${templateData.currentDate}</p>
        <p style="font-size: 10pt;">Contract ID: #${contract.id}</p>
      </div>
    </body>
    </html>
    `;
    
    // Launch Puppeteer with Chromium
    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath(),
      headless: true,
      defaultViewport: null,
    });
    
    const page = await browser.newPage();
    
    // Set content and generate PDF
    console.log('Setting HTML content and generating PDF...');
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
    
    console.log('Successfully generated PDF using Word template + Puppeteer');
    return new Uint8Array(pdfBuffer);
    
  } catch (error) {
    console.error('Failed to generate PDF using Word template + Puppeteer:', error);
    console.log('Falling back to basic PDF generation...');
    return await generateBasicPDF(contract, user);
  } finally {
    if (browser) {
      await browser.close();
    }
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
        ${contract.children.map((child: any, index: number) => 
          `<p>Child ${index + 1}: ${child.name}${child.age ? ` (Age ${child.age})` : ''}</p>`
        ).join('')}
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
    
    // Ages
    userAge: contract.userAge || '[Your Age]',
    partnerAge: contract.partnerAge || '[Partner Age]', 
    
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