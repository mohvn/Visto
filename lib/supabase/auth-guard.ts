import { NextResponse } from "next/server";
import { createClient } from "./server";

export async function withAuth<T>(
  handler: (userId: string, supabase: Awaited<ReturnType<typeof createClient>>) => Promise<T>
): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await handler(user.id, supabase);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
