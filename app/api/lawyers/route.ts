import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { lawyers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch active lawyers for send-to-lawyer page
export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeLawyers = await db
      .select({
        id: lawyers.id,
        name: lawyers.name,
        email: lawyers.email,
        firm: lawyers.firm,
        phone: lawyers.phone,
        specializations: lawyers.specializations,
        party: lawyers.party
      })
      .from(lawyers)
      .where(eq(lawyers.isActive, 'true'))
      .orderBy(lawyers.name);

    return NextResponse.json({ lawyers: activeLawyers });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lawyers' },
      { status: 500 }
    );
  }
}