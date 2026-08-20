import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour, Vercel Edge will handle the spam


export async function GET() {
  // Endpoint statis untuk Auto-Updater Bot
  // Bisa diganti valuenya secara manual di sini saat ada update baru
  return NextResponse.json({
    latest_version: "1.0.1",
    hash: "e3824d2c61b200d89900edf6b84b0aa8e197d7613bf40f1ea25ce9b16cabede8",
    download_url: "https://url-tempat-kamu-menaruh/OnmyojiFarmBotQt_WGC_Fixed.exe"
  });
}
