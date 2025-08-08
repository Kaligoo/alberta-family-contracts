#!/usr/bin/env node

// Simple command-line email testing script for Resend
// Usage: node scripts/test-email.js <recipient-email>

require('dotenv').config({ path: '.env.development.local' });
const { Resend } = require('resend');

async function sendTestEmail(to) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'emailverification@agreeable.ca',
      to: [to],
      subject: 'Test Email from Agreeable',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email sent from the command line using Resend!</p>
        <p>Sent to: ${to}</p>
        <p>From: emailverification@agreeable.ca</p>
      `,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      process.exit(1);
    }

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', data.id);
    console.log('To:', to);
    console.log('From: emailverification@agreeable.ca');
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    process.exit(1);
  }
}

// Get recipient from command line argument
const recipient = process.argv[2];

if (!recipient) {
  console.log('Usage: node scripts/test-email.js <recipient-email>');
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.log('❌ RESEND_API_KEY environment variable not set');
  process.exit(1);
}

sendTestEmail(recipient);