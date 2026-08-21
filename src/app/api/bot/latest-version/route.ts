import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour, Vercel Edge will handle the spam


export async function GET() {
  // Endpoint statis untuk Auto-Updater Bot
  // Bisa diganti valuenya secara manual di sini saat ada update baru
  return NextResponse.json({
    latest_version: "1.0.1",
    hash: "bd1b06b6b22e986b2e22b7a063d526280c618545a93b950eb5fdc694c2310418",
    download_url: "https://heiantactics.space/api/bot/download?tag=v1.0.1&file=OnmyojiFarmBotQt_WGC_Fixed.zip" // Atau sesuaikan dengan nama file .zip Anda di Github Release
  });
}
