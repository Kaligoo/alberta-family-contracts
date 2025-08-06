import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, activityLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { comparePasswords, setSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Debug login test starting for:', email);
    
    // Step 1: Test user query
    let foundUsers;
    try {
      foundUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      console.log('✅ User query successful, found:', foundUsers.length, 'users');
    } catch (error) {
      console.error('❌ User query failed:', error);
      return NextResponse.json({
        success: false,
        step: 'user_query',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    if (foundUsers.length === 0) {
      return NextResponse.json({
        success: false,
        step: 'user_not_found',
        message: 'No user found with this email'
      });
    }
    
    const foundUser = foundUsers[0];
    console.log('Found user:', { id: foundUser.id, email: foundUser.email, role: foundUser.role });
    
    // Step 2: Test password comparison
    let isPasswordValid;
    try {
      isPasswordValid = await comparePasswords(password, foundUser.passwordHash);
      console.log('✅ Password comparison successful, valid:', isPasswordValid);
    } catch (error) {
      console.error('❌ Password comparison failed:', error);
      return NextResponse.json({
        success: false,
        step: 'password_compare',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        step: 'invalid_password',
        message: 'Password is invalid'
      });
    }
    
    // Step 3: Test activity log insertion
    try {
      await db.insert(activityLogs).values({
        userId: foundUser.id,
        action: 'SIGN_IN',
        ipAddress: ''
      });
      console.log('✅ Activity log insertion successful');
    } catch (error) {
      console.error('❌ Activity log insertion failed:', error);
      return NextResponse.json({
        success: false,
        step: 'activity_log',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Step 4: Test session creation
    try {
      await setSession(foundUser);
      console.log('✅ Session creation successful');
    } catch (error) {
      console.error('❌ Session creation failed:', error);
      return NextResponse.json({
        success: false,
        step: 'session_creation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    console.log('✅ All login steps completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Login test completed successfully',
      user: {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role
      }
    });
    
  } catch (error) {
    console.error('❌ General login test error:', error);
    return NextResponse.json({
      success: false,
      step: 'general_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}