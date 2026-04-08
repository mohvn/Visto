import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: commentId } = await params;

  return withAuth(async (userId, supabase) => {
    const { data } = await supabase
      .from("comment_likes")
      .select("user_id")
      .eq("user_id", userId)
      .eq("comment_id", commentId)
      .maybeSingle();

    if (data) {
      await supabase
        .from("comment_likes")
        .delete()
        .eq("user_id", userId)
        .eq("comment_id", commentId);
      return { liked: false };
    }

    await supabase
      .from("comment_likes")
      .insert({ user_id: userId, comment_id: commentId });
    return { liked: true };
  });
}
