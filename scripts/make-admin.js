const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');
const { users } = require('../lib/db/schema');
const { eq } = require('drizzle-orm');

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function makeAdmin(email) {
  try {
    console.log(`Making ${email} an admin...`);
    
    const result = await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    console.log(`Successfully made ${email} an admin.`);
    console.log('Updated user:', result[0]);
  } catch (error) {
    console.error('Error making user admin:', error);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node scripts/make-admin.js <email>');
  process.exit(1);
}

makeAdmin(email);