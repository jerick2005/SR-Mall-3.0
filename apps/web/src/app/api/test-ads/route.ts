import { NextResponse } from "next/server";
import { getActiveMallAds } from "@/app/actions/ads";

export async function GET() {
  try {
    console.log("🔍 Testing ads fetch...");
    const ads = await getActiveMallAds();
    console.log("📊 Ads fetched:", ads.length, "items");

    return NextResponse.json({
      success: true,
      count: ads.length,
      ads: ads,
    });
  } catch (error) {
    console.error("❌ Error fetching ads:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
