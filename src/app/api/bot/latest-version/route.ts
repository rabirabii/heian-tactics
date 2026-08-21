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
    hash: "6b19f4f54656f482eff02cfcc025f640fd3cd5a47c7bf6f3588f1b2b4ec4e862",

    changelog:
      "Phase 5: Dynamic Icon Anchor Vision, Turbo Multi-Scale Detection & 5-Resource Inventory Sync",
  });
}
