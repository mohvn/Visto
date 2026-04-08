import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { showId, seasonNumber, episodes, runtimes, showName, posterPath } = body as {
    showId: number;
    seasonNumber: number;
    episodes: number[];
    runtimes?: Record<number, number>;
    showName?: string;
    posterPath?: string | null;
  };

  return withAuth(async (userId, supabase) => {
    const rows = episodes.map((ep: number) => ({
      user_id: userId,
      show_id: showId,
      season_number: seasonNumber,
      episode_number: ep,
      episode_runtime: runtimes?.[ep] ?? 0,
    }));

    await supabase
      .from("watched_episodes")
      .upsert(rows, { onConflict: "user_id,show_id,season_number,episode_number" });

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
  const { showId, seasonNumber, episodes } = body as {
    showId: number;
    seasonNumber: number;
    episodes: number[];
  };

  return withAuth(async (userId, supabase) => {
    await supabase
      .from("watched_episodes")
      .delete()
      .eq("user_id", userId)
      .eq("show_id", showId)
      .eq("season_number", seasonNumber)
      .in("episode_number", episodes);
    return { ok: true };
  });
}
