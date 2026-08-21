import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag"); // Contoh: "v1.0.1"
    const fileName = searchParams.get("file"); // Contoh: "patch_v1.0.1.zip"

    if (!tag || !fileName) {
      return NextResponse.json({ error: "Missing tag or file parameter" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;

    if (!token || !owner || !repo) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
    }

    // 1. Ambil detail release dari GitHub API
    const releaseRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "HeianTactics-Backend",
        },
      }
    );

    if (!releaseRes.ok) {
      return NextResponse.json({ error: "Release tag not found" }, { status: 404 });
    }

    const releaseData = await releaseRes.json();
    
    // 2. Cari asset ID berdasarkan nama file
    const asset = releaseData.assets?.find((a: any) => a.name === fileName);
    if (!asset) {
      return NextResponse.json({ error: "Asset file not found in release" }, { status: 404 });
    }

    // 3. Download asset binary dari GitHub API
    const assetRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/octet-stream",
          "User-Agent": "HeianTactics-Backend",
        },
        redirect: "follow",
      }
    );

    if (!assetRes.ok) {
      return NextResponse.json({ error: "Failed to fetch asset binary from GitHub" }, { status: 502 });
    }

    // 4. Stream file binary ke pengguna
    const fileBuffer = await assetRes.arrayBuffer();
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
