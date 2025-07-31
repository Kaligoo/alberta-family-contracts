import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function POST() {
  try {
    const user = await getUser();
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Creating lawyers table...');

    // Create the lawyers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS lawyers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        firm VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        website VARCHAR(255),
        party VARCHAR(20) NOT NULL CHECK (party IN ('user', 'partner', 'both')),
        is_active VARCHAR(10) NOT NULL DEFAULT 'true',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    console.log('✅ Lawyers table created successfully');

    // Check if the table was created
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'lawyers'
      );
    `);

    const tableExists = tableCheck.rows[0]?.exists;

    if (tableExists) {
      // Add some sample data
      console.log('🔧 Adding sample lawyers...');
      
      await db.execute(sql`
        INSERT INTO lawyers (name, email, firm, party, phone, website) VALUES
        ('Garrett Horvath', 'gharath@kahanelaw.com', 'Kahane Law', 'both', '403-233-8411', 'https://www.kahanelaw.com'),
        ('Sarah Johnson', 'sarah.johnson@familylaw.ca', 'Johnson Family Law', 'user', '403-555-0123', 'https://www.johnsonfamilylaw.ca'),
        ('Michael Chen', 'mchen@albertalegal.com', 'Alberta Legal Services', 'partner', '403-555-0456', 'https://www.albertalegal.com'),
        ('Emily Watson', 'ewatson@watsonlaw.ca', 'Watson & Associates', 'both', '403-555-0789', 'https://www.watsonlaw.ca')
        ON CONFLICT (email) DO NOTHING
      `);

      const count = await db.execute(sql`SELECT COUNT(*) as count FROM lawyers`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Lawyers table created successfully',
        tableExists: true,
        lawyerCount: count.rows[0]?.count || 0
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Table creation failed',
        tableExists: false 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error creating lawyers table:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create lawyers table'
    }, { status: 500 });
  }
}