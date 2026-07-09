import { NextRequest, NextResponse } from "next/server";
import { fetchPlayerInfo } from "@/lib/ff-api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const uid = searchParams.get("uid");
  const region = searchParams.get("region") || "IND";

  if (!uid || !/^\d+$/.test(uid)) {
    return NextResponse.json(
      { error: "Invalid UID. Must be a numeric player ID." },
      { status: 400 }
    );
  }

  try {
    const { data, source, message } = await fetchPlayerInfo(uid, region);
    return NextResponse.json({
      ...data,
      _source: source,
      _message: message || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch player data. Please try again." },
      { status: 500 }
    );
  }
}