import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { lawyers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST - Add a new lawyer (accessible to regular users)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, firm, party } = body;

    if (!name || !email || !firm || !party) {
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
    const existingLawyer = await db
      .select()
      .from(lawyers)
      .where(eq(lawyers.email, email))
      .limit(1);

    if (existingLawyer.length > 0) {
      return NextResponse.json(
        { error: 'A lawyer with this email already exists' },
        { status: 400 }
      );
    }

    const [newLawyer] = await db
      .insert(lawyers)
      .values({
        name,
        email,
        firm,
        party,
        isActive: 'true'
      })
      .returning();

    return NextResponse.json({ lawyer: newLawyer }, { status: 201 });
  } catch (error) {
    console.error('Error adding lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to add lawyer' },
      { status: 500 }
    );
  }
}