import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendVerificationEmail } from '@/lib/email/resend';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user with unverified email
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.emailVerified, null), // Not verified
          eq(users.deletedAt, null) // Not deleted
        )
      )
      .limit(1);

    if (user.length === 0) {
      // Don't reveal whether email exists (security)
      return NextResponse.json({
        success: true,
        message: 'If an unverified account exists with this email, a verification email has been sent.',
      });
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await db
      .update(users)
      .set({
        emailVerificationToken: verificationToken,
        emailVerificationExpires: expiresAt,
      })
      .where(eq(users.id, user[0].id));

    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    console.log('✅ Resent verification email to:', email);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}