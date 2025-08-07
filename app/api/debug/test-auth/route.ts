import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { familyContracts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signIn } from '@/app/(login)/actions';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json();
    
    if (action === 'test-login') {
      // Simulate login with the test account
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      try {
        const result = await signIn({ email, password }, formData);
        return NextResponse.json({
          success: true,
          message: 'Login test completed',
          loginResult: result
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'Login failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          loginResult: null
        });
      }
    }
    
    if (action === 'test-user-fetch') {
      // Test getting current user
      try {
        const user = await getUser();
        
        if (!user) {
          return NextResponse.json({
            success: false,
            message: 'No authenticated user found',
            user: null,
            contracts: null
          });
        }
        
        // Test getting contracts for this user
        const contracts = await db
          .select()
          .from(familyContracts)
          .where(eq(familyContracts.userId, user.id));
        
        return NextResponse.json({
          success: true,
          message: 'User and contracts retrieved successfully',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          contracts: contracts.map(c => ({
            id: c.id,
            userFullName: c.userFullName,
            partnerFullName: c.partnerFullName,
            status: c.status,
            createdAt: c.createdAt
          }))
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'Error fetching user or contracts',
          error: error instanceof Error ? error.message : 'Unknown error',
          user: null,
          contracts: null
        });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Debug auth test error:', error);
    return NextResponse.json(
      { 
        error: 'Debug test failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}