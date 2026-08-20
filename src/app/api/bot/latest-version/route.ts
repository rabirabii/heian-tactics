import { NextResponse } from 'next/server';

export async function GET() {
  // Endpoint statis untuk Auto-Updater Bot
  // Bisa diganti valuenya secara manual di sini saat ada update baru
  return NextResponse.json({
    latest_version: "1.0.1",
    download_url: "https://url-tempat-kamu-menaruh/OnmyojiFarmBotQt_WGC_Fixed.exe"
  });
}
