import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function GET(req: NextRequest) {
  const showId = new URL(req.url).searchParams.get("showId");

  return withAuth(async (userId, supabase) => {
    const { data: allLists } = await supabase
      .from("lists")
      .select("id, name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!showId) return allLists ?? [];

    const { data: listsWithItem } = await supabase
      .from("lists")
      .select("id, list_items!inner(show_id)")
      .eq("user_id", userId);

    const numShowId = Number(showId);
    const idsWithShow = new Set(
      listsWithItem
        ?.filter((l) =>
          l.list_items.some(
            (i: { show_id: number }) => i.show_id === numShowId
          )
        )
        .map((l) => l.id) ?? []
    );

    return (allLists ?? []).map((l) => ({
      ...l,
      has_show: idsWithShow.has(l.id),
    }));
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, showId, showName, posterPath } = body;

  return withAuth(async (userId, supabase) => {
    const { data } = await supabase
      .from("lists")
      .insert({ user_id: userId, name })
      .select("id, name")
      .single();

    if (data && showId) {
      await supabase.from("list_items").insert({
        list_id: data.id,
        show_id: showId,
        show_name: showName,
        poster_path: posterPath,
      });
      return { ...data, has_show: true };
    }

    return data;
  });
}
