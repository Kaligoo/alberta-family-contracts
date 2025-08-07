# Database Schema Safety Guide

This guide ensures database schema changes are deployed safely to prevent production issues.

## 🚨 CRITICAL: Always Follow This Process

### 1. Before Making Schema Changes
```bash
# Validate current production schema
npm run schema:validate
```

### 2. Making Schema Changes
1. **Update schema in `lib/db/schema.ts`**
2. **Generate migration**: `npm run db:generate` 
3. **Test locally**: Apply migration and test all functionality
4. **Use safe deployment**: `npm run deploy:safe` (validates before pushing)

### 3. For Complex Changes (like removing columns)
Use the migration helpers:

```typescript
import { runSafeMigration, migrationSteps } from '@/lib/db/migration-helpers';

const removeTeamColumns = async () => {
  await runSafeMigration('remove_team_columns', [
    migrationSteps.dropColumn('users', 'team_id'),
    migrationSteps.dropColumn('family_contracts', 'team_id'),
    migrationSteps.dropColumn('activity_logs', 'team_id'),
  ]);
};
```

### 4. After Deployment
```bash
# Verify production schema health
curl https://agreeable.ca/api/admin/validate-schema
```

## 🛠️ Available Tools

### Schema Validation
- **Endpoint**: `GET /api/admin/validate-schema`
- **Script**: `npm run schema:validate`
- **Purpose**: Validates production schema matches code expectations

### Safe Migration Runner
- **Location**: `lib/db/migration-helpers.ts`
- **Features**: Automatic rollback on failure, step verification
- **Purpose**: Apply complex migrations safely

### Pre-Deploy Check
- **Script**: `scripts/pre-deploy-check.js`
- **Purpose**: Block deployments if schema issues exist
- **Usage**: `npm run deploy:safe`

## 🚨 Never Do These

❌ **Don't use `db.select()` on tables with >50 columns** - Use explicit field selection
❌ **Don't modify production database manually** - Always use migration scripts  
❌ **Don't deploy without schema validation** - Always run `npm run schema:validate`
❌ **Don't remove columns without checking dependencies** - Use cascade analysis

## ✅ Always Do These

✅ **Test migrations locally first**
✅ **Use explicit field selection for large tables** 
✅ **Validate schema after every deployment**
✅ **Keep rollback scripts ready**
✅ **Monitor for 500 errors after deployment**

## 🔍 Troubleshooting Schema Issues

### Common Problems:
1. **Login fails**: Check `activity_logs` table has `action`, `timestamp`, `ip_address` columns
2. **Contracts don't load**: Check `family_contracts` query uses explicit field selection
3. **500 errors**: Check schema validation endpoint for mismatches

### Quick Fixes:
```sql
-- Fix missing activity_logs columns
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS action text NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS timestamp timestamp NOT NULL DEFAULT now();
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip_address varchar(45);
ALTER TABLE activity_logs ALTER COLUMN action DROP DEFAULT;

-- Remove problematic team columns
ALTER TABLE users DROP COLUMN IF EXISTS team_id CASCADE;
ALTER TABLE family_contracts DROP COLUMN IF EXISTS team_id CASCADE;
ALTER TABLE activity_logs DROP COLUMN IF EXISTS team_id CASCADE;
```

## 📊 Schema Health Monitoring

The `/api/admin/validate-schema` endpoint returns:
- ✅ **Schema validation results** 
- ✅ **Missing/extra columns**
- ✅ **Query capability tests**
- ✅ **Actionable recommendations**

Use this endpoint to monitor production health and catch issues early.