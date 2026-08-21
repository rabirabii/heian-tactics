import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600; // Cache for 1 hour, Vercel Edge will handle the spam

export async function GET() {
  // Endpoint statis untuk Auto-Updater Bot
  // Bisa diganti valuenya secara manual di sini saat ada update baru
  return NextResponse.json({
    version: "1.0.3.1",
    type: "patch",
    download_url: "https://www.heiantactics.space/api/bot/download?tag=v1.0.3.1&file=patch_v1.0.3.1.zip",
    hash: "8bea4c89a804631d97a70cfa5b740c314e9f35c515956c0a2b30e773f511c7c1",
    changelog: "Hotfix v1.0.3.1: Realm Raid Session KO Persistence, Animation Settle Buffer & Lightweight 19MB Patch",
  });
}
