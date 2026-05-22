import { NextResponse } from 'next/server';
import { getMegaStorageInfo } from '@/lib/mega';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const storage = await getMegaStorageInfo();
    return NextResponse.json({ success: true, storage });
  } catch (error) {
    console.error('Storage API error:', error);
    // Graceful fallback if Mega API is rate-limited or has credentials issues
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch storage info',
      storage: {
        used: 2 * 1024 * 1024 * 1024, // 2 GB fallback
        total: 50 * 1024 * 1024 * 1024, // 50 GB standard free tier limit
      }
    });
  }
}
