import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour, Vercel Edge will handle the spam


export async function GET() {
  // Endpoint statis untuk Auto-Updater Bot
  // Bisa diganti valuenya secara manual di sini saat ada update baru
  return NextResponse.json({
    version: "1.0.2",
    type: "patch",
    download_url: "https://www.heiantactics.space/api/bot/download?tag=v1.0.2&file=patch_v1.0.2.zip",
    hash: "50fca8ff636ff6b6115f753e6dc82896969be84cd575db0dfa7d8d6c85437f34",
    changelog: "Phase 4: Universal Normalized UV Coordinates & Realm Raid Daruma Victory Fix"
  });
}
