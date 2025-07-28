# Version Management Scripts

This directory contains scripts for automatic version management.

## Auto-Increment on Commit

A Git pre-commit hook automatically increments the version number on every commit:

- **Location**: `.git/hooks/pre-commit`
- **Behavior**: Increments the minor version number (e.g., 0.17 → 0.18)
- **File**: Updates `version.json` at project root

## Manual Version Increment

You can also manually increment the version:

```bash
npm run version:increment
```

## Version Format

Versions follow the format `MAJOR.MINOR`:
- **Major**: Incremented manually for major releases
- **Minor**: Auto-incremented on every commit

## Files

- `increment-version.js` - Node.js script that handles version incrementing
- `.git/hooks/pre-commit` - Git hook that runs on every commit
- `../version.json` - Version storage file

This ensures consistent version tracking without manual intervention.