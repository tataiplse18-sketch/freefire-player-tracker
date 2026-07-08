import { NextRequest, NextResponse } from "next/server";
import { fetchItemImage } from "@/lib/ff-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  try {
    const result = await fetchItemImage(id);

    if (result) {
      return new NextResponse(result.buffer, {
        headers: {
          "Content-Type": result.contentType,
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Fallback: redirect to the original CDN (browser will handle it)
    return NextResponse.redirect(
      `https://ffitems.devhubx.org/items/${id}`,
      302
    );
  } catch {
    return NextResponse.redirect(
      `https://ffitems.devhubx.org/items/${id}`,
      302
    );
  }
}