/**
 * Automatically applies database migrations after schema changes
 * This function should be called whenever Claude makes changes to the database schema
 */
export async function runAutoMigration(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔧 Running automatic database migration...');
    
    const response = await fetch('/api/admin/auto-migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auto-migrate-key': 'claude-auto-migrate-2024'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Auto-migration completed:', result.appliedMigrations);
      return {
        success: true,
        message: `Migration successful. Applied: ${result.appliedMigrations.join(', ')}`
      };
    } else {
      console.error('❌ Auto-migration failed:', result.error);
      return {
        success: false,
        message: `Migration failed: ${result.error}`
      };
    }
  } catch (error) {
    console.error('❌ Auto-migration error:', error);
    return {
      success: false,
      message: `Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Utility to run migration from server-side API routes
 */
export async function runAutoMigrationServer(): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://albertafamilycontracts.com';
    
    const response = await fetch(`${baseUrl}/api/admin/auto-migrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auto-migrate-key': 'claude-auto-migrate-2024'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Server auto-migration completed:', result.appliedMigrations);
      return {
        success: true,
        message: `Migration successful. Applied: ${result.appliedMigrations.join(', ')}`
      };
    } else {
      console.error('❌ Server auto-migration failed:', result.error);
      return {
        success: false,
        message: `Migration failed: ${result.error}`
      };
    }
  } catch (error) {
    console.error('❌ Server auto-migration error:', error);
    return {
      success: false,
      message: `Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}