import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const showId = Number(searchParams.get("showId"));
  const season = Number(searchParams.get("season"));
  const episode = Number(searchParams.get("episode"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentUserId = user?.id ?? null;

  const { data: rawComments } = await supabase
    .from("episode_comments")
    .select("id, user_id, content, parent_id, created_at")
    .eq("show_id", showId)
    .eq("season_number", season)
    .eq("episode_number", episode)
    .order("created_at", { ascending: true });

  if (!rawComments || rawComments.length === 0) {
    return NextResponse.json({ comments: [], userId: currentUserId });
  }

  const userIds = [...new Set(rawComments.map((c) => c.user_id))];
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds);

  const profilesMap = new Map<string, string | null>();
  for (const p of profilesData ?? []) profilesMap.set(p.id, p.username);

  const commentIds = rawComments.map((c) => c.id);
  const { data: allLikes } = await supabase
    .from("comment_likes")
    .select("comment_id, user_id")
    .in("comment_id", commentIds);

  const likesMap = new Map<string, { count: number; likedByMe: boolean }>();
  for (const like of allLikes ?? []) {
    const entry = likesMap.get(like.comment_id) ?? { count: 0, likedByMe: false };
    entry.count++;
    if (like.user_id === currentUserId) entry.likedByMe = true;
    likesMap.set(like.comment_id, entry);
  }

  const comments = rawComments.map((c) => {
    const ld = likesMap.get(c.id);
    return {
      ...c,
      username: profilesMap.get(c.user_id) ?? null,
      likes_count: ld?.count ?? 0,
      liked_by_me: ld?.likedByMe ?? false,
    };
  });

  return NextResponse.json({ comments, userId: currentUserId });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { showId, seasonNumber, episodeNumber, parentId, content } = body;

  return withAuth(async (userId, supabase) => {
    await supabase.from("episode_comments").insert({
      user_id: userId,
      show_id: showId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      parent_id: parentId ?? null,
      content,
    });
    return { ok: true };
  });
}
