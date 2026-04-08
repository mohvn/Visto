import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function GET() {
  return withAuth(async (userId, supabase) => {
    const { data } = await supabase
      .from("watched_episodes")
      .select("show_id, season_number, episode_number")
      .eq("user_id", userId);
    return data ?? [];
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { showId, seasonNumber, episodeNumber, runtime, showName, posterPath } = body;

  return withAuth(async (userId, supabase) => {
    await supabase.from("watched_episodes").insert({
      user_id: userId,
      show_id: showId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      episode_runtime: runtime ?? 0,
    });

    if (showName) {
      await supabase.from("user_shows").upsert(
        {
          user_id: userId,
          show_id: showId,
          show_name: showName,
          poster_path: posterPath,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: "user_id,show_id" }
      );
    }

    return { ok: true };
  });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { showId, seasonNumber, episodeNumber } = body;

  return withAuth(async (userId, supabase) => {
    await supabase
      .from("watched_episodes")
      .delete()
      .eq("user_id", userId)
      .eq("show_id", showId)
      .eq("season_number", seasonNumber)
      .eq("episode_number", episodeNumber);
    return { ok: true };
  });
}
