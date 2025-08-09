import { Resend } from 'resend';

function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY);
}

function createAdminSaleNotificationTemplate(
  userFullName: string,
  partnerFullName: string,
  contractType: string,
  contractId: string,
  paymentAmount?: string
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Sale - ${contractType} #${contractId}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">
            💰 New Sale Completed
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">
            Contract purchase completed successfully
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">
            Sale Summary
          </h2>
          
          <!-- Contract Details -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px;">Contract Information</h3>
            <div style="color: #4b5563; font-size: 14px;">
              <p style="margin: 5px 0;"><strong>Contract ID:</strong> #${contractId}</p>
              <p style="margin: 5px 0;"><strong>Document Type:</strong> ${contractType}</p>
              <p style="margin: 5px 0;"><strong>Purchase Date:</strong> ${new Date().toLocaleDateString()}</p>
              ${paymentAmount ? `<p style="margin: 5px 0;"><strong>Amount:</strong> ${paymentAmount}</p>` : ''}
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
          
          <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0; text-align: center;">
            This notification was generated automatically when the contract payment was completed.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

export async function sendAdminSaleNotification(
  contractId: string,
  userFullName: string,
  partnerFullName: string,
  contractType: string,
  paymentAmount?: string
): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured, skipping admin notification');
      return;
    }

    const resend = getResendClient();
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Agreeable <emailverification@agreeable.ca>';
    
    console.log('Sending admin sale notification...');
    
    const adminEmailResult = await resend.emails.send({
      from: fromEmail,
      to: ['admin@agreeable.ca'],
      subject: `New Sale - ${contractType} #${contractId}`,
      html: createAdminSaleNotificationTemplate(
        userFullName,
        partnerFullName,
        contractType,
        contractId,
        paymentAmount
      ),
    });

    if (adminEmailResult.error) {
      console.error('Failed to send admin sale notification:', adminEmailResult.error.message);
    } else {
      console.log(`✅ Admin sale notification sent: ${adminEmailResult.data?.id}`);
    }
  } catch (error) {
    console.error('Error sending admin sale notification:', error);
    // Don't throw - this is a notification only
  }
}