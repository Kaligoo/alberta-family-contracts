import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const versionPath = path.join(process.cwd(), 'version.json');
    const versionData = fs.readFileSync(versionPath, 'utf8');
    const { version } = JSON.parse(versionData);
    
    return NextResponse.json({ version });
  } catch (error) {
    console.error('Error reading version:', error);
    return NextResponse.json({ version: '0.0' }, { status: 500 });
  }
}