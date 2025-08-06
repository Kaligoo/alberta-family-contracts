import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Check the activity_logs table schema
    const schema = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'activity_logs'
      ORDER BY ordinal_position;
    `);

    // Try a simple insert to see what fails
    let insertError = null;
    try {
      await db.execute(sql`
        INSERT INTO activity_logs (user_id, action, ip_address) 
        VALUES (1, 'TEST', '127.0.0.1')
      `);
      await db.execute(sql`
        DELETE FROM activity_logs 
        WHERE action = 'TEST' AND user_id = 1
      `);
    } catch (error) {
      insertError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      activityLogsSchema: schema.rows || schema,
      insertTestError: insertError,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking activity logs schema:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check activity logs schema', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}