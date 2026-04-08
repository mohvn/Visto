import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { username, avatarUrl } = body;

  return withAuth(async (userId, supabase) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
}
