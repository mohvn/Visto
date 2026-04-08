import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const showId = Number(searchParams.get("showId"));
  const season = Number(searchParams.get("season"));
  const episode = Number(searchParams.get("episode"));

  return withAuth(async (userId, supabase) => {
    const { data } = await supabase
      .from("episode_reviews")
      .select("rating, watched_on")
      .eq("user_id", userId)
      .eq("show_id", showId)
      .eq("season_number", season)
      .eq("episode_number", episode)
      .maybeSingle();

    return data ?? { rating: null, watched_on: null };
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { showId, seasonNumber, episodeNumber, rating, watchedOn } = body;

  return withAuth(async (userId, supabase) => {
    await supabase.from("episode_reviews").upsert(
      {
        user_id: userId,
        show_id: showId,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        rating: rating || null,
        watched_on: watchedOn || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,show_id,season_number,episode_number" }
    );
    return { ok: true };
  });
}
