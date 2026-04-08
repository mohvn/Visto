import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTVShow } from "@/lib/tmdb";
import { Header } from "@/components/header";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ShowScroll } from "@/components/profile/show-scroll";
import { ListsSection } from "@/components/profile/lists-section";
import { ProfileForm } from "@/components/profile-form";
import { Separator } from "@/components/ui/separator";
import { Heart, MonitorPlay, Settings } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [
    { data: profile },
    { count: episodeCount },
    { data: watchedByShow },
    { data: userShows },
    { data: favorites },
    { data: lists },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("watched_episodes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("watched_episodes")
      .select("show_id, episode_runtime")
      .eq("user_id", user.id),
    supabase
      .from("user_shows")
      .select("show_id, show_name, poster_path")
      .eq("user_id", user.id)
      .order("last_watched_at", { ascending: false })
      .limit(30),
    supabase
      .from("favorite_shows")
      .select("show_id, show_name, poster_path")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("lists")
      .select("id, name, description, list_items(show_id, show_name, poster_path)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  // Calculate TV time: group episodes by show, fetch avg runtime from TMDB
  const epsByShow = new Map<number, { count: number; runtimeSum: number }>();
  for (const ep of watchedByShow ?? []) {
    const entry = epsByShow.get(ep.show_id) ?? { count: 0, runtimeSum: 0 };
    entry.count++;
    entry.runtimeSum += ep.episode_runtime || 0;
    epsByShow.set(ep.show_id, entry);
  }

  let totalMinutes = 0;
  const showsNeedingRuntime: number[] = [];

  for (const [showId, { count, runtimeSum }] of epsByShow) {
    if (runtimeSum > 0) {
      totalMinutes += runtimeSum;
    } else {
      showsNeedingRuntime.push(showId);
    }
  }

  if (showsNeedingRuntime.length > 0) {
    const showDetails = await Promise.all(
      showsNeedingRuntime.map((id) => getTVShow(id).catch(() => null))
    );
    for (const show of showDetails) {
      if (!show) continue;
      const entry = epsByShow.get(show.id);
      if (!entry) continue;
      const avgRuntime =
        show.episode_run_time?.length > 0
          ? show.episode_run_time.reduce((a, b) => a + b, 0) /
            show.episode_run_time.length
          : 40;
      totalMinutes += Math.round(entry.count * avgRuntime);
    }
  }

  const showsTracked = userShows?.length ?? 0;
  const displayName =
    profile?.username || user.user_metadata?.username || user.email?.split("@")[0] || "Usuário";
  const initial = displayName[0].toUpperCase();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Profile header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold shadow-lg shadow-primary/20">
              {initial}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Link
                href="#settings"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
              >
                <Settings className="h-3 w-3" />
                Editar perfil
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-10">
        {/* Stats */}
        <section>
          <h2 className="text-lg font-bold mb-4">Stats</h2>
          <ProfileStats
            totalMinutes={totalMinutes}
            episodesWatched={episodeCount ?? 0}
            showsTracked={showsTracked}
          />
        </section>

        {/* Lists */}
        <section>
          <ListsSection lists={lists ?? []} />
        </section>

        <Separator />

        {/* Shows */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MonitorPlay className="h-5 w-5 text-primary" />
            Shows
          </h2>
          <ShowScroll shows={userShows ?? []} />
        </section>

        <Separator />

        {/* Favorites */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            Séries favoritas
          </h2>
          <ShowScroll shows={favorites ?? []} />
        </section>

        <Separator />

        {/* Edit profile */}
        <section id="settings">
          <ProfileForm
            initialUsername={profile?.username ?? ""}
            initialAvatarUrl={profile?.avatar_url ?? ""}
          />
        </section>
      </main>
    </div>
  );
}
