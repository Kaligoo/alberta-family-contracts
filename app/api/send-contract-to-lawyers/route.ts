import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { Resend } from 'resend';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

async function generatePDF(contractId: string, request: NextRequest): Promise<ArrayBuffer> {
  try {
    // Forward authentication headers from the original request
    const headers: HeadersInit = {};
    
    // Copy relevant headers for authentication
    const authHeaders = ['cookie', 'authorization'];
    authHeaders.forEach(headerName => {
      const value = request.headers.get(headerName);
      if (value) {
        headers[headerName] = value;
      }
    });

    const pdfResponse = await fetch(`${process.env.BASE_URL || 'https://agreeable.ca'}/api/contracts/${contractId}/pdf-v2`, {
      headers
    });
    
    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text();
      console.error(`PDF generation failed with status ${pdfResponse.status}:`, errorText);
      throw new Error(`Failed to generate PDF: ${pdfResponse.status} - ${errorText}`);
    }
    return await pdfResponse.arrayBuffer();
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as xxx-xxx-xxxx if we have 10 digits
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phone;
}

function createLawyerEmailTemplate(
  lawyerName: string,
  clientName: string,
  partnerName: string,
  contractType: string,
  contractId: string,
  isUserLawyer: boolean,
  clientEmail?: string,
  clientPhone?: string
): string {
  const baseUrl = process.env.BASE_URL || 'https://agreeable.ca';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New ${contractType} - Independent Legal Advice Required</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
            agreeable.ca
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
            Legal Document Service Platform
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
            Independent Legal Advice Request
          </h2>
          
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
            Dear ${lawyerName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
            You have been selected by <strong>${clientName}</strong> to provide independent legal advice on a ${contractType.toLowerCase()} with <strong>${partnerName}</strong>.
          </p>

          <!-- What is Agreeable -->
          <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
            <h3 style="color: #0369a1; margin: 0 0 12px 0; font-size: 18px;">About Agreeable</h3>
            <p style="color: #0c4a6e; margin: 0; font-size: 14px;">
              Agreeable is a legal document platform that helps couples create professional family agreements. 
              Our system generates comprehensive documents based on their specific circumstances, which are then 
              reviewed by independent lawyers like yourself to ensure proper legal advice and execution.
            </p>
          </div>
          
          <!-- Contract Details -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Contract Details</h3>
            <div style="color: #4b5563; font-size: 14px;">
              <p style="margin: 5px 0;"><strong>Your Client:</strong> ${clientName}</p>
              ${clientEmail ? `<p style="margin: 5px 0;"><strong>Client Email:</strong> ${clientEmail}</p>` : ''}
              ${clientPhone ? `<p style="margin: 5px 0;"><strong>Client Phone:</strong> ${formatPhoneNumber(clientPhone)}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Partner:</strong> ${partnerName}</p>
              <p style="margin: 5px 0;"><strong>Document Type:</strong> ${contractType}</p>
              <p style="margin: 5px 0;"><strong>Contract ID:</strong> #${contractId}</p>
              <p style="margin: 5px 0;"><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <!-- What's Required -->
          <h3 style="color: #1f2937; font-size: 18px; margin: 25px 0 15px 0;">What's Required</h3>
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 15px 0;">
            Your client will need to schedule a consultation with you to:
          </p>
          <ul style="color: #4b5563; font-size: 16px; margin: 0 0 20px 20px; padding: 0;">
            <li style="margin: 8px 0;">Review the terms and conditions of the agreement</li>
            <li style="margin: 8px 0;">Receive independent legal advice specific to their situation</li>
            <li style="margin: 8px 0;">Ask questions about their rights and obligations</li>
            <li style="margin: 8px 0;">Sign the agreement if everything is satisfactory</li>
          </ul>
          
          <!-- Attachments -->
          <div style="background-color: #fefbf2; border-left: 4px solid #fbbf24; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
            <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 18px;">📎 Attached Documents</h3>
            <ul style="color: #92400e; margin: 0; font-size: 14px; padding-left: 20px;">
              <li style="margin: 5px 0;">Word Document (.docx) - Editable version for review</li>
              <li style="margin: 5px 0;">PDF Document (.pdf) - Final formatted version</li>
            </ul>
          </div>
          
          <!-- Next Steps -->
          <h3 style="color: #1f2937; font-size: 18px; margin: 25px 0 15px 0;">Next Steps</h3>
          <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
            Please contact <strong>${clientName}</strong> to arrange a consultation at your earliest convenience. 
            Both parties must receive independent legal advice before the agreement can be executed.
          </p>
          
          <!-- Support -->
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">Questions or Support?</h3>
            <p style="color: #1e40af; font-size: 14px; margin: 0 0 15px 0;">
              Learn more about our platform and services:
            </p>
            <div style="margin: 15px 0;">
              <a href="${baseUrl}/about" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; margin: 5px; font-weight: 600;">
                About Agreeable
              </a>
            </div>
            <p style="color: #1e40af; font-size: 14px; margin: 15px 0 0 0;">
              Technical questions? Contact <a href="mailto:info@agreeable.com" style="color: #2563eb; text-decoration: none;"><strong>info@agreeable.com</strong></a>
            </p>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; margin: 25px 0 0 0;">
            Thank you for providing independent legal advice.<br>
            <strong>The Agreeable Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
            This email was sent from Agreeable (agreeable.ca) - Legal Document Platform
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Contract ID: #${contractId} | Generated: ${new Date().toLocaleDateString()}
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

function createAdminNotificationTemplate(
  userFullName: string,
  partnerFullName: string,
  contractType: string,
  contractId: string,
  userLawyerName: string,
  partnerLawyerName: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sale Completed - ${contractType} #${contractId}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            💰 Sale Completed
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
            Contract sent to lawyers successfully
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
            New Sale Summary
          </h2>
          
          <!-- Contract Details -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Contract Information</h3>
            <div style="color: #4b5563; font-size: 14px;">
              <p style="margin: 5px 0;"><strong>Contract ID:</strong> #${contractId}</p>
              <p style="margin: 5px 0;"><strong>Document Type:</strong> ${contractType}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <!-- Parties -->
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">👥 Parties</h3>
            <div style="color: #92400e; font-size: 14px;">
              <p style="margin: 5px 0;"><strong>Party A:</strong> ${userFullName}</p>
              <p style="margin: 5px 0;"><strong>Party B:</strong> ${partnerFullName}</p>
            </div>
          </div>

          <!-- Selected Lawyers -->
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">⚖️ Selected Lawyers</h3>
            <div style="color: #1e40af; font-size: 14px;">
              <p style="margin: 5px 0;"><strong>${userFullName}'s Lawyer:</strong> ${userLawyerName}</p>
              <p style="margin: 5px 0;"><strong>${partnerFullName}'s Lawyer:</strong> ${partnerLawyerName}</p>
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0; text-align: center;">
            This notification was generated automatically when the contract was successfully sent to both lawyers.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const contractId = formData.get('contractId') as string;
    const userLawyerEmail = formData.get('userLawyerEmail') as string;
    const userLawyerName = formData.get('userLawyerName') as string;
    const partnerLawyerEmail = formData.get('partnerLawyerEmail') as string;
    const partnerLawyerName = formData.get('partnerLawyerName') as string;
    const userFullName = formData.get('userFullName') as string;
    const partnerFullName = formData.get('partnerFullName') as string;
    const contractDocument = formData.get('contractDocument') as File;

    if (!contractId || !userLawyerEmail || !partnerLawyerEmail || !contractDocument) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    console.log('Sending contract to lawyers:');
    console.log(`User Lawyer: ${userLawyerName} (${userLawyerEmail})`);
    console.log(`Partner Lawyer: ${partnerLawyerName} (${partnerLawyerEmail})`);
    console.log(`Contract ID: ${contractId}`);
    console.log(`Parties: ${userFullName} & ${partnerFullName}`);

    // Get contract details from database
    const [contract] = await db
      .select()
      .from(familyContracts)
      .where(eq(familyContracts.id, parseInt(contractId)))
      .limit(1);

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const contractType = contract.contractType === 'cohabitation' 
      ? 'Alberta Cohabitation Agreement'
      : contract.contractType === 'prenuptial'
      ? 'Alberta Prenuptial Agreement' 
      : 'Alberta Family Agreement';

    // Generate PDF document
    let pdfBuffer: ArrayBuffer;
    try {
      pdfBuffer = await generatePDF(contractId, request);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      return NextResponse.json({ 
        error: 'Failed to generate PDF document' 
      }, { status: 500 });
    }

    // Convert Word document to buffer
    const wordBuffer = await contractDocument.arrayBuffer();

    // Initialize Resend client
    const resend = getResendClient();

    // Prepare email data
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Agreeable <emailverification@agreeable.ca>';
    const subject = `Independent Legal Advice Required - ${contractType}`;

    const emailResults = [];

    // Send email to user's lawyer
    try {
      console.log(`Sending email to user's lawyer: ${userLawyerEmail}`);
      
      const userEmailResult = await resend.emails.send({
        from: fromEmail,
        to: [userLawyerEmail],
        subject: `${subject} - ${userFullName}`,
        html: createLawyerEmailTemplate(
          userLawyerName,
          userFullName,
          partnerFullName,
          contractType,
          contractId,
          true,
          contract.userEmail || undefined,
          contract.userPhone || undefined
        ),
        attachments: [
          {
            filename: `agreement-${contractId}.docx`,
            content: Buffer.from(wordBuffer),
          },
          {
            filename: `agreement-${contractId}.pdf`,
            content: Buffer.from(pdfBuffer),
          },
        ],
      });

      if (userEmailResult.error) {
        throw new Error(`Failed to send email to user lawyer: ${userEmailResult.error.message}`);
      }

      emailResults.push({
        lawyer: 'user',
        name: userLawyerName,
        email: userLawyerEmail,
        messageId: userEmailResult.data?.id,
        status: 'sent'
      });

      console.log(`✅ Email sent to user's lawyer: ${userEmailResult.data?.id}`);
    } catch (error) {
      console.error('Error sending email to user lawyer:', error);
      emailResults.push({
        lawyer: 'user',
        name: userLawyerName,
        email: userLawyerEmail,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Send email to partner's lawyer
    try {
      console.log(`Sending email to partner's lawyer: ${partnerLawyerEmail}`);
      
      const partnerEmailResult = await resend.emails.send({
        from: fromEmail,
        to: [partnerLawyerEmail],
        subject: `${subject} - ${partnerFullName}`,
        html: createLawyerEmailTemplate(
          partnerLawyerName,
          partnerFullName,
          userFullName,
          contractType,
          contractId,
          false,
          contract.partnerEmail || undefined,
          contract.partnerPhone || undefined
        ),
        attachments: [
          {
            filename: `agreement-${contractId}.docx`,
            content: Buffer.from(wordBuffer),
          },
          {
            filename: `agreement-${contractId}.pdf`,
            content: Buffer.from(pdfBuffer),
          },
        ],
      });

      if (partnerEmailResult.error) {
        throw new Error(`Failed to send email to partner lawyer: ${partnerEmailResult.error.message}`);
      }

      emailResults.push({
        lawyer: 'partner',
        name: partnerLawyerName,
        email: partnerLawyerEmail,
        messageId: partnerEmailResult.data?.id,
        status: 'sent'
      });

      console.log(`✅ Email sent to partner's lawyer: ${partnerEmailResult.data?.id}`);
    } catch (error) {
      console.error('Error sending email to partner lawyer:', error);
      emailResults.push({
        lawyer: 'partner',
        name: partnerLawyerName,
        email: partnerLawyerEmail,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Check results
    const failedEmails = emailResults.filter(result => result.status === 'failed');
    const successfulEmails = emailResults.filter(result => result.status === 'sent');

    if (failedEmails.length > 0 && successfulEmails.length === 0) {
      // All emails failed
      return NextResponse.json({
        success: false,
        error: 'Failed to send emails to both lawyers',
        details: emailResults
      }, { status: 500 });
    } else if (failedEmails.length > 0) {
      // Some emails failed
      return NextResponse.json({
        success: false,
        error: `Failed to send email${failedEmails.length > 1 ? 's' : ''} to ${failedEmails.map(e => e.name).join(' and ')}`,
        details: emailResults
      }, { status: 207 }); // 207 Multi-Status
    } else {
      // All emails sent successfully - now send admin notification
      try {
        console.log('Sending admin notification email...');
        
        const adminEmailResult = await resend.emails.send({
          from: fromEmail,
          to: ['admin@agreeable.com'],
          subject: `Sale Completed - ${contractType} #${contractId}`,
          html: createAdminNotificationTemplate(
            userFullName,
            partnerFullName,
            contractType,
            contractId,
            userLawyerName,
            partnerLawyerName
          ),
        });

        if (adminEmailResult.error) {
          console.error('Failed to send admin notification:', adminEmailResult.error.message);
        } else {
          console.log(`✅ Admin notification sent: ${adminEmailResult.data?.id}`);
        }
      } catch (error) {
        console.error('Error sending admin notification:', error);
        // Don't fail the main request if admin notification fails
      }

      return NextResponse.json({
        success: true,
        message: 'Contract documents sent successfully to both lawyers',
        details: emailResults
      });
    }

  } catch (error) {
    console.error('Error sending contract to lawyers:', error);
    return NextResponse.json(
      { error: 'Failed to send contract to lawyers' },
      { status: 500 }
    );
  }
}