import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      // Update to admin
      const result = await db
        .update(users)
        .set({ role: 'admin' })
        .where(eq(users.email, email))
        .returning();

      return NextResponse.json({ 
        message: 'User already exists, promoted to admin',
        user: result[0]
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name: name || 'Admin User',
        email,
        passwordHash,
        role: 'admin'
      })
      .returning();

    // Create a team for the admin
    const newTeam = await db
      .insert(teams)
      .values({
        name: `${name || email}'s Team`
      })
      .returning();

    // Add user to team
    await db
      .insert(teamMembers)
      .values({
        userId: newUser[0].id,
        teamId: newTeam[0].id,
        role: 'owner'
      });

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      user: newUser[0]
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    );
  }
}