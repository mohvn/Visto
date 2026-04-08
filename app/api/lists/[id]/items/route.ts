import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listId } = await params;
  const body = await req.json();
  const { showId, showName, posterPath } = body;

  return withAuth(async (_userId, supabase) => {
    await supabase.from("list_items").insert({
      list_id: listId,
      show_id: showId,
      show_name: showName,
      poster_path: posterPath,
    });
    return { ok: true };
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listId } = await params;
  const showId = Number(new URL(req.url).searchParams.get("showId"));

  return withAuth(async (_userId, supabase) => {
    await supabase
      .from("list_items")
      .delete()
      .eq("list_id", listId)
      .eq("show_id", showId);
    return { ok: true };
  });
}
