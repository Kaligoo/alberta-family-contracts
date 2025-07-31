import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { lawyers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch single lawyer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const lawyerId = parseInt(resolvedParams.id);

    if (isNaN(lawyerId)) {
      return NextResponse.json({ error: 'Invalid lawyer ID' }, { status: 400 });
    }

    const [lawyer] = await db
      .select()
      .from(lawyers)
      .where(eq(lawyers.id, lawyerId))
      .limit(1);

    if (!lawyer) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 });
    }

    return NextResponse.json({ lawyer });
  } catch (error) {
    console.error('Error fetching lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lawyer' },
      { status: 500 }
    );
  }
}

// PUT - Update lawyer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const lawyerId = parseInt(resolvedParams.id);

    if (isNaN(lawyerId)) {
      return NextResponse.json({ error: 'Invalid lawyer ID' }, { status: 400 });
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

    const [updatedLawyer] = await db
      .update(lawyers)
      .set({
        name,
        email,
        firm,
        phone: phone || null,
        address: address || null,
        website: website || null,
        party,
        isActive: isActive || 'true',
        updatedAt: new Date()
      })
      .where(eq(lawyers.id, lawyerId))
      .returning();

    if (!updatedLawyer) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 });
    }

    return NextResponse.json({ lawyer: updatedLawyer });
  } catch (error) {
    console.error('Error updating lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to update lawyer' },
      { status: 500 }
    );
  }
}

// DELETE - Delete lawyer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const lawyerId = parseInt(resolvedParams.id);

    if (isNaN(lawyerId)) {
      return NextResponse.json({ error: 'Invalid lawyer ID' }, { status: 400 });
    }

    const [deletedLawyer] = await db
      .delete(lawyers)
      .where(eq(lawyers.id, lawyerId))
      .returning();

    if (!deletedLawyer) {
      return NextResponse.json({ error: 'Lawyer not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Lawyer deleted successfully' });
  } catch (error) {
    console.error('Error deleting lawyer:', error);
    return NextResponse.json(
      { error: 'Failed to delete lawyer' },
      { status: 500 }
    );
  }
}