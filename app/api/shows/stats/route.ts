import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const showId = req.nextUrl.searchParams.get("showId");
  if (!showId) {
    return NextResponse.json({ error: "showId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_show_tracker_count", {
    p_show_id: parseInt(showId, 10),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ trackerCount: data ?? 0 });
}
