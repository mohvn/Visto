import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(async (userId, supabase) => {
    await supabase
      .from("episode_comments")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    return { ok: true };
  });
}
