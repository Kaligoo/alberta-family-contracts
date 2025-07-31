const { drizzle } = require('drizzle-orm/neon-http');
const { neon } = require('@neondatabase/serverless');

async function createLawyersTable() {
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    console.log('Creating lawyers table...');
    
    await sql`
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
    `;

    console.log('✅ Lawyers table created successfully');
    
    // Check if table exists and has data
    const result = await sql`SELECT COUNT(*) as count FROM lawyers`;
    console.log(`📊 Current lawyer count: ${result[0].count}`);
    
  } catch (error) {
    console.error('❌ Error creating lawyers table:', error);
    process.exit(1);
  }
}

createLawyersTable();