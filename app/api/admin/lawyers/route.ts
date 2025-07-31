import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { lawyers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch all lawyers
export async function GET() {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allLawyers = await db
      .select()
      .from(lawyers)
      .orderBy(lawyers.name);

    return NextResponse.json({ lawyers: allLawyers });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lawyers' },
      { status: 500 }
    );
  }
}

// POST - Create a new lawyer
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, firm, phone, address, website, party, isActive } = body;

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

    const [newLawyer] = await db
      .insert(lawyers)
      .values({
        name,
        email,
        firm,
        phone: phone || null,
        address: address || null,
        website: website || null,
        party,
        isActive: isActive || 'true'
      })
      .returning();

    return NextResponse.json({ lawyer: newLawyer }, { status: 201 });
  } catch (error) {
    console.error('Error creating lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to create lawyer' },
      { status: 500 }
    );
  }
}