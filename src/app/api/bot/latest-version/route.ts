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
    hash: "6838ac356421d8c19df6e264c3d2636d0159d229ad0e45b029eb970a5ac562ca",

    changelog:
      "Phase 5: Dynamic Icon Anchor Vision, Turbo Multi-Scale Detection & 5-Resource Inventory Sync",
  });
}
