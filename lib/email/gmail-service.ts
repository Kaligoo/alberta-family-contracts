import { google } from 'googleapis';

// For sending emails from emailverification@agreeable.ca
// This uses domain-wide delegation with a service account

async function getGmailServiceClient() {
  const serviceAccountKey = {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`
  };

  const auth = new google.auth.JWT({
    email: serviceAccountKey.client_email,
    key: serviceAccountKey.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: 'emailverification@agreeable.ca', // Impersonate this user
  });

  return google.gmail({ version: 'v1', auth });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  try {
    const gmail = await getGmailServiceClient();
    
    const fromEmail = from || `"Agreeable" <emailverification@agreeable.ca>`;
    
    // Create the email message
    const message = [
      `From: ${fromEmail}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      html,
    ].join('\n');
    
    // Encode the message in base64url
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    const response = await gmail.users.messages.send({
      userId: 'emailverification@agreeable.ca',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    console.log('Email sent successfully from emailverification@agreeable.ca:', response.data.id);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error('Gmail service error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Agreeable</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
            Agreeable
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
            Verify Your Email Address
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
            Welcome to Agreeable!
          </h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0; font-size: 16px;">
            Thank you for creating your account. To complete your registration and start creating 
            your personalized family agreement, please verify your email address.
          </p>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
                      color: white; 
                      padding: 16px 32px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block; 
                      font-weight: 600;
                      font-size: 16px;
                      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);">
              ✓ Verify Email Address
            </a>
          </div>
          
          <!-- Alternative Link -->
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; margin: 0;">
              <a href="${verificationUrl}" style="color: #f97316; text-decoration: none; font-size: 14px;">
                ${verificationUrl}
              </a>
            </p>
          </div>
          
          <!-- Security Notice -->
          <div style="border-left: 4px solid #fbbf24; background-color: #fefbf2; padding: 16px; margin: 25px 0; border-radius: 0 4px 4px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> This verification link expires in 24 hours for your protection.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 25px 0 0 0;">
            Best regards,<br>
            <strong>The Agreeable Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
            This email was sent to ${email} from emailverification@agreeable.ca
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Agreeable',
    html,
  });
}