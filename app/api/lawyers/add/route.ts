import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { lawyers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Add a new lawyer (accessible to regular users)
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Add lawyer API called');
    const user = await getUser();
    console.log('🔵 User check:', user ? 'Authenticated' : 'Not authenticated');
    
    if (!user) {
      console.log('❌ Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, firm, party } = body;
    console.log('🔵 Request data:', { name, email, firm, party });

    if (!name || !email || !firm || !party) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Name, email, firm, and party are required' },
        { status: 400 }
      );
    }

    if (!['user', 'partner', 'both'].includes(party)) {
      return NextResponse.json(
        { error: 'Party must be "user", "partner", or "both"' },
        { status: 400 }
      );
    }

    // Check for duplicate email
    console.log('🔵 Checking for duplicate email...');
    const existingLawyer = await db
      .select()
      .from(lawyers)
      .where(eq(lawyers.email, email))
      .limit(1);

    if (existingLawyer.length > 0) {
      console.log('❌ Duplicate email found');
      return NextResponse.json(
        { error: 'A lawyer with this email already exists' },
        { status: 400 }
      );
    }

    console.log('🔵 Inserting new lawyer...');
    const [newLawyer] = await db
      .insert(lawyers)
      .values({
        name,
        email,
        firm,
        phone: null,
        address: null,
        website: null,
        party,
        isActive: 'true'
      })
      .returning();
    
    console.log('✅ Lawyer created successfully:', newLawyer.id);

    return NextResponse.json({ lawyer: newLawyer }, { status: 201 });
  } catch (error) {
    console.error('Error adding lawyer:', error);
    
    // Check if it's a database constraint error
    if (error instanceof Error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'A lawyer with this email already exists' },
          { status: 400 }
        );
      }
      if (error.message.includes('relation') || error.message.includes('table')) {
        return NextResponse.json(
          { error: 'Database table not found. Please contact support.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to add lawyer. Please try again.' },
      { status: 500 }
    );
  }
}