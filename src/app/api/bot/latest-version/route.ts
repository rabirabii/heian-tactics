import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600; // Cache for 1 hour, Vercel Edge will handle the spam

export async function GET() {
  // Endpoint statis untuk Auto-Updater Bot
  // Bisa diganti valuenya secara manual di sini saat ada update baru
  return NextResponse.json({
    version: "1.0.4",
    type: "patch",
    download_url: "https://www.heiantactics.space/api/bot/download?tag=v1.0.4&file=patch_v1.0.4.zip",
    hash: "21e764299e6235ad092200c7f9e0e751c90485207a46220f90dd16414c5af21f",
    changelog: "Multi-Resolution Warehouse Sync, Exploration Monster Calibration, Realm Raid Fixes & Clean GUI Layout",
  });
}
