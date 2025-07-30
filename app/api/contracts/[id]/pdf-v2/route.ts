import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

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

    // Generate PDF using Gotenberg
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
    console.log('Starting PDF v2 generation using Gotenberg...');
    
    // Prepare template data
    const templateData = prepareTemplateData(contract, user);
    
    // Create enhanced HTML for Gotenberg conversion
    const html = generateEnhancedHTML(templateData, contract);
    
    // Convert HTML to PDF using Gotenberg
    const pdfBuffer = await convertWithGotenberg(html);
    
    console.log('Successfully generated PDF v2 using Gotenberg');
    return new Uint8Array(pdfBuffer);
    
  } catch (error) {
    console.error('Failed to generate PDF v2 using Gotenberg:', error);
    throw error;
  }
}

async function convertWithGotenberg(html: string): Promise<Buffer> {
  // Default to localhost for development, but allow override via environment variable
  const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://localhost:3000';
  
  try {
    // Create form data for Gotenberg
    const formData = new FormData();
    
    // Add the main HTML file
    const htmlBlob = new Blob([html], { type: 'text/html' });
    formData.append('files', htmlBlob, 'index.html');
    
    // Optional: Add CSS for better styling (can be enhanced later)
    const css = `
      @page {
        size: A4;
        margin: 1in;
      }
      body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
      }
    `;
    const cssBlob = new Blob([css], { type: 'text/css' });
    formData.append('files', cssBlob, 'style.css');
    
    // Send request to Gotenberg
    const response = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gotenberg returned ${response.status}: ${errorText}`);
    }
    
    // Get PDF buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
    
  } catch (error) {
    // If Gotenberg is not available, throw a more helpful error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Gotenberg service not available at ${GOTENBERG_URL}. Please start Gotenberg with: docker run --rm -p 3000:3000 gotenberg/gotenberg:8`);
    }
    throw error;
  }
}

function generateEnhancedHTML(templateData: any, contract: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Alberta Cohabitation Agreement</title>
      <link rel="stylesheet" href="style.css">
      <style>
        @page {
          size: A4;
          margin: 0.75in;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #000;
          margin: 0;
          padding: 0;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 18pt;
          font-weight: bold;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .parties {
          text-align: center;
          margin-bottom: 30px;
          font-size: 12pt;
        }
        .parties p {
          margin: 8px 0;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 15px;
          text-transform: uppercase;
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
        }
        .subsection {
          margin-bottom: 15px;
        }
        .subsection-title {
          font-weight: bold;
          margin-bottom: 8px;
        }
        .clause {
          margin-bottom: 12px;
          text-align: justify;
        }
        .signature-section {
          margin-top: 50px;
          page-break-inside: avoid;
        }
        .signature-line {
          border-bottom: 1px solid #000;
          display: inline-block;
          width: 300px;
          height: 20px;
          margin: 20px 0 5px 0;
        }
        .date-line {
          border-bottom: 1px solid #000;
          display: inline-block;
          width: 150px;
          height: 20px;
          margin: 10px 0 5px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #666;
          font-size: 9pt;
          color: #666;
        }
        .legal-notice {
          background: #f5f5f5;
          padding: 15px;
          border: 1px solid #ccc;
          margin: 20px 0;
          font-size: 10pt;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        td, th {
          padding: 8px;
          border: 1px solid #333;
          text-align: left;
        }
        th {
          background: #f0f0f0;
          font-weight: bold;
        }
        .financial-table td:last-child {
          text-align: right;
        }
        ul {
          margin: 10px 0;
          padding-left: 25px;
        }
        li {
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Alberta Cohabitation Agreement</h1>
      </div>
      
      <div class="parties">
        <p><strong>${templateData.userFullName}</strong></p>
        <p>(hereinafter referred to as "${templateData.userFirstName}")</p>
        <p style="margin: 20px 0; font-size: 14pt;">- and -</p>
        <p><strong>${templateData.partnerFullName}</strong></p>
        <p>(hereinafter referred to as "${templateData.partnerFirstName}")</p>
      </div>

      <div class="section">
        <div class="section-title">Agreement Details</div>
        <div class="clause">
          <strong>Effective Date:</strong> ${templateData.currentDate}
        </div>
        ${contract.cohabDate ? `
        <div class="clause">
          <strong>Cohabitation Start Date:</strong> ${templateData.cohabDate}
        </div>
        ` : ''}
        ${contract.residenceAddress ? `
        <div class="clause">
          <strong>Residence Address:</strong> ${contract.residenceAddress}
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Parties Information</div>
        <table>
          <tr>
            <th>Detail</th>
            <th>${templateData.userFirstName}</th>
            <th>${templateData.partnerFirstName}</th>
          </tr>
          ${(contract.userAge || contract.partnerAge) ? `
          <tr>
            <td>Age</td>
            <td>${contract.userAge || 'Not specified'}</td>
            <td>${contract.partnerAge || 'Not specified'}</td>
          </tr>
          ` : ''}
          ${(contract.userJobTitle || contract.partnerJobTitle) ? `
          <tr>
            <td>Occupation</td>
            <td>${contract.userJobTitle || 'Not specified'}</td>
            <td>${contract.partnerJobTitle || 'Not specified'}</td>
          </tr>
          ` : ''}
          ${(contract.userIncome || contract.partnerIncome) ? `
          <tr>
            <td>Annual Income</td>
            <td>${templateData.userIncome}</td>
            <td>${templateData.partnerIncome}</td>
          </tr>
          ` : ''}
          ${(contract.userEmail || contract.partnerEmail) ? `
          <tr>
            <td>Email</td>
            <td>${contract.userEmail || 'Not provided'}</td>
            <td>${contract.partnerEmail || 'Not provided'}</td>
          </tr>
          ` : ''}
          ${(contract.userPhone || contract.partnerPhone) ? `
          <tr>
            <td>Phone</td>
            <td>${contract.userPhone || 'Not provided'}</td>
            <td>${contract.partnerPhone || 'Not provided'}</td>
          </tr>
          ` : ''}
          ${(contract.userAddress || contract.partnerAddress) ? `
          <tr>
            <td>Address</td>
            <td>${contract.userAddress || 'Not provided'}</td>
            <td>${contract.partnerAddress || 'Not provided'}</td>
          </tr>
          ` : ''}
        </table>
      </div>

      ${(contract.children && contract.children.length > 0) ? `
      <div class="section">
        <div class="section-title">Children</div>
        <div class="clause">
          The parties have ${contract.children.length} child${contract.children.length > 1 ? 'ren' : ''} of the relationship:
        </div>
        <ul>
          ${contract.children.map((child: any, index: number) => {
            let childInfo = `<li><strong>${child.name}</strong>`;
            if (child.birthdate) {
              const birthDate = new Date(child.birthdate);
              const birthYear = birthDate.getFullYear();
              const birthMonth = birthDate.toLocaleDateString('en-US', { month: 'long' });
              const birthDay = birthDate.getDate();
              childInfo += ` (born ${birthMonth} ${birthDay}, ${birthYear})`;
            }
            if (child.relationship && child.relationship !== 'biological') {
              childInfo += ` - ${child.relationship} child`;
            }
            if (child.parentage && child.parentage !== 'both') {
              childInfo += ` - ${child.parentage === 'user' ? templateData.userFirstName : templateData.partnerFirstName}'s child`;
            }
            childInfo += `</li>`;
            return childInfo;
          }).join('')}
        </ul>
      </div>
      ` : `
      <div class="section">
        <div class="section-title">Children</div>
        <div class="clause">
          There are no children of the relationship as of the Effective Date of this Agreement. 
          The parties may or may not have children together in the future, either biological or adopted.
        </div>
      </div>
      `}

      ${contract.residenceOwnership ? `
      <div class="section">
        <div class="section-title">Residence</div>
        <div class="clause">
          <strong>Property Ownership:</strong> ${contract.residenceOwnership.charAt(0).toUpperCase() + contract.residenceOwnership.slice(1)}
        </div>
        ${contract.expenseSplitType ? `
        <div class="clause">
          <strong>Expense Arrangement:</strong> ${
            contract.expenseSplitType === 'equal' ? 'Equal split (50/50)' :
            contract.expenseSplitType === 'proportional' ? 'Proportional to income' :
            'Custom arrangement'
          }
        </div>
        ` : ''}
      </div>
      ` : ''}

      ${contract.additionalClauses ? `
      <div class="section">
        <div class="section-title">Additional Terms</div>
        <div class="clause">
          ${contract.additionalClauses.replace(/\n/g, '<br>')}
        </div>
      </div>
      ` : ''}

      <div class="legal-notice">
        <p><strong>IMPORTANT LEGAL NOTICE</strong></p>
        <p>
          This document is a draft cohabitation agreement generated for informational purposes only. 
          Both parties should seek independent legal advice before signing this agreement. 
          This document should be reviewed by qualified legal counsel to ensure it meets your specific needs 
          and complies with current Alberta law.
        </p>
      </div>

      <div class="signature-section">
        <div class="section-title">Execution</div>
        
        <table style="margin-top: 40px;">
          <tr>
            <td style="width: 50%; border: none; padding: 20px;">
              <div>
                <div class="signature-line"></div>
                <p><strong>${templateData.userFullName}</strong></p>
                <p>(${templateData.userFirstName})</p>
                <br>
                <div class="date-line"></div>
                <p>Date</p>
              </div>
            </td>
            <td style="width: 50%; border: none; padding: 20px;">
              <div>
                <div class="signature-line"></div>
                <p><strong>${templateData.partnerFullName}</strong></p>
                <p>(${templateData.partnerFirstName})</p>
                <br>
                <div class="date-line"></div>
                <p>Date</p>
              </div>
            </td>
          </tr>
        </table>
      </div>

      ${contract.notes ? `
      <div class="section">
        <div class="section-title">Personal Notes</div>
        <div class="clause">
          ${contract.notes.replace(/\n/g, '<br>')}
        </div>
      </div>
      ` : ''}

      <div class="footer">
        <p><strong>Document Information</strong></p>
        <p>Generated by: Alberta Family Contracts</p>
        <p>Generated on: ${templateData.currentDate}</p>
        <p>Contract ID: #${contract.id}</p>
        <p>Version: Gotenberg PDF v2</p>
        <p>
          <em>This document was generated using Gotenberg PDF conversion technology. 
          For questions or support, please contact Alberta Family Contracts.</em>
        </p>
      </div>
    </body>
    </html>
  `;
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
    
    // Dates
    currentDate: currentDate,
    contractDate: currentDate,
    cohabDate: contract.cohabDate ? new Date(contract.cohabDate).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : currentDate,
    
    // Ages
    userAge: contract.user_age || contract.userAge || '[Your Age]',
    partnerAge: contract.partner_age || contract.partnerAge || '[Partner Age]',
  };
}