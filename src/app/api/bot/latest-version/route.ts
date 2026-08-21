import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600; // Cache for 1 hour, Vercel Edge will handle the spam

export async function GET() {
  // Endpoint statis untuk Auto-Updater Bot
  // Bisa diganti valuenya secara manual di sini saat ada update baru
  return NextResponse.json({
    version: "1.0.3",
    type: "patch",
    download_url:
      "https://www.heiantactics.space/api/bot/download?tag=v1.0.3&file=patch_v1.0.3.zip",
    hash: "2d153d89960c9cb580d66c6bc5aaff5c45021b5a55971100e9a330e0a76a4f54",
    changelog:
      "Phase 5: Dynamic Icon Anchor Vision, Turbo Multi-Scale Detection & 5-Resource Inventory Sync",
  });
}
