import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const showId = Number(new URL(req.url).searchParams.get("showId"));

  return withAuth(async (userId, supabase) => {
    const { data } = await supabase
      .from("favorite_shows")
      .select("id")
      .eq("user_id", userId)
      .eq("show_id", showId)
      .maybeSingle();

    return { isFavorite: !!data };
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { showId, showName, posterPath } = body;

  return withAuth(async (userId, supabase) => {
    await supabase.from("favorite_shows").insert({
      user_id: userId,
      show_id: showId,
      show_name: showName,
      poster_path: posterPath,
    });
    return { ok: true };
  });
}

export async function DELETE(req: NextRequest) {
  const showId = Number(new URL(req.url).searchParams.get("showId"));

  return withAuth(async (userId, supabase) => {
    await supabase
      .from("favorite_shows")
      .delete()
      .eq("user_id", userId)
      .eq("show_id", showId);
    return { ok: true };
  });
}
