import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';

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

    // For testing purposes, we'll simulate sending emails
    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    // - Resend
    
    console.log('Sending contract to lawyers:');
    console.log(`User Lawyer: ${userLawyerName} (${userLawyerEmail})`);
    console.log(`Partner Lawyer: ${partnerLawyerName} (${partnerLawyerEmail})`);
    console.log(`Contract ID: ${contractId}`);
    console.log(`Parties: ${userFullName} & ${partnerFullName}`);
    console.log(`Document size: ${contractDocument.size} bytes`);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For now, we'll just log the action and return success
    // In production, you would:
    // 1. Convert the document to base64 or save temporarily
    // 2. Compose professional email content
    // 3. Send emails with attachment to both lawyers
    // 4. Log the activity in the database
    // 5. Potentially notify the users

    const emailContent = {
      subject: `New Alberta Cohabitation Agreement - ${userFullName} & ${partnerFullName}`,
      userLawyerMessage: `
Dear ${userLawyerName},

You have been selected to provide legal counsel for ${userFullName} regarding their cohabitation agreement with ${partnerFullName}.

Please find the attached draft agreement for your review. Your client will need to schedule a consultation to:
- Review the terms and conditions
- Provide legal advice specific to their situation
- Sign the agreement if everything is satisfactory

Contract Details:
- Client: ${userFullName}
- Partner: ${partnerFullName}
- Contract ID: #${contractId}
- Document Type: Alberta Cohabitation Agreement

Please contact your client to arrange a consultation at your earliest convenience.

Best regards,
Alberta Family Contracts Team
      `,
      partnerLawyerMessage: `
Dear ${partnerLawyerName},

You have been selected to provide legal counsel for ${partnerFullName} regarding their cohabitation agreement with ${userFullName}.

Please find the attached draft agreement for your review. Your client will need to schedule a consultation to:
- Review the terms and conditions  
- Provide legal advice specific to their situation
- Sign the agreement if everything is satisfactory

Contract Details:
- Client: ${partnerFullName}
- Partner: ${userFullName}
- Contract ID: #${contractId}
- Document Type: Alberta Cohabitation Agreement

Please contact your client to arrange a consultation at your earliest convenience.

Best regards,
Alberta Family Contracts Team
      `
    };

    // TODO: Implement actual email sending
    // Example with a hypothetical email service:
    /*
    await emailService.send({
      to: userLawyerEmail,
      subject: emailContent.subject,
      text: emailContent.userLawyerMessage,
      attachments: [{
        filename: `cohabitation-agreement-${contractId}.docx`,
        content: await contractDocument.arrayBuffer()
      }]
    });

    await emailService.send({
      to: partnerLawyerEmail,
      subject: emailContent.subject,
      text: emailContent.partnerLawyerMessage,
      attachments: [{
        filename: `cohabitation-agreement-${contractId}.docx`,
        content: await contractDocument.arrayBuffer()
      }]
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Contract sent successfully to both lawyers',
      details: {
        userLawyer: `${userLawyerName} (${userLawyerEmail})`,
        partnerLawyer: `${partnerLawyerName} (${partnerLawyerEmail})`,
        contractId,
        emailContent // For testing - remove in production
      }
    });

  } catch (error) {
    console.error('Error sending contract to lawyers:', error);
    return NextResponse.json(
      { error: 'Failed to send contract to lawyers' },
      { status: 500 }
    );
  }
}