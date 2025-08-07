const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { users } = require('../lib/db/schema');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function createAdminUser(email, password, name = 'Admin User') {
  try {
    console.log(`Creating admin user: ${email}`);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`User ${email} already exists. Making them admin...`);
      
      // Update to admin
      const result = await db
        .update(users)
        .set({ role: 'admin' })
        .where(eq(users.email, email))
        .returning();

      console.log(`Successfully made ${email} an admin.`);
      return result[0];
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: 'admin'
      })
      .returning();

    console.log(`Successfully created admin user: ${email}`);
    
    return newUser[0];
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Get credentials from command line arguments
const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4];

if (!email || !password) {
  console.log('Usage: node scripts/create-admin-user.js <email> <password> [name]');
  process.exit(1);
}

createAdminUser(email, password, name);