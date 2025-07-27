import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

async function runMigrations() {
  const sql = neon(process.env.POSTGRES_URL!);
  
  console.log('🔄 Running database migrations...');

  try {
    // Read migration files
    const migrationsDir = path.join(__dirname, 'lib', 'db', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Check if migrations table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS drizzle_migrations (
          id SERIAL PRIMARY KEY,
          hash TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
    } catch (error) {
      console.log('Migrations table already exists or created');
    }

    // Get already applied migrations
    const appliedMigrations = await sql`
      SELECT hash FROM drizzle_migrations
    `;
    
    const appliedHashes = new Set(appliedMigrations.map((m: any) => m.hash));

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Simple hash of file content
      const hash = Buffer.from(content).toString('base64').slice(0, 20);
      
      if (appliedHashes.has(hash)) {
        console.log(`⏭️  Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`🔄 Applying ${file}...`);
      
      // Split by statement breakpoint comments
      const statements = content
        .split('--> statement-breakpoint')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          await sql.unsafe(statement);
        }
      }

      // Record migration as applied
      await sql`
        INSERT INTO drizzle_migrations (hash) VALUES (${hash})
      `;
      
      console.log(`✅ Applied ${file}`);
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();