import { google } from 'googleapis';
import { auth } from '@/auth';

// Create Gmail API client with OAuth2
async function getGmailClient() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('No authenticated user session');
  }
  
  // Get the user's access token from the database
  const { db } = await import('@/lib/db/drizzle');
  const { accounts } = await import('@/lib/db/auth-schema');
  const { eq } = await import('drizzle-orm');
  
  const account = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, parseInt(session.user.id)))
    .limit(1);
  
  if (!account.length || !account[0].access_token) {
    throw new Error('No Google account linked or access token expired');
  }
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials({
    access_token: account[0].access_token,
    refresh_token: account[0].refresh_token,
  });
  
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  try {
    const gmail = await getGmailClient();
    const session = await auth();
    
    const fromEmail = from || `"Alberta Family Contracts" <emailverification@agreeable.ca>`;
    
    // Create the email message
    const message = [
      `From: ${fromEmail}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
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
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    console.log('Email sent successfully:', response.data.id);
    return { success: true, messageId: response.data.id };
  } catch (error) {
    console.error('Gmail API error:', error);
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
      <title>Verify Your Email - Alberta Family Contracts</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
            Alberta Family Contracts
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
            Verify Your Email Address
          </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">
            Welcome to Alberta Family Contracts!
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
            <strong>The Alberta Family Contracts Team</strong>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0 0 8px 0;">
            This email was sent to ${email} because you created an account on Alberta Family Contracts.
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
    subject: 'Verify Your Email - Alberta Family Contracts',
    html,
  });
}