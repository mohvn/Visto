import { NextRequest } from "next/server";
import { withAuth } from "@/lib/supabase/auth-guard";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;

  return withAuth(async (_userId, supabase) => {
    await supabase.from("list_items").delete().eq("id", itemId);
    return { ok: true };
  });
}
