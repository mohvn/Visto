import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTVShow, getSeason, type Episode } from "@/lib/tmdb";
import { Header } from "@/components/header";
import { WatchlistCard, type WatchlistItem } from "@/components/watchlist-card";
import { CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: userShows }, { data: watchedEps }] = await Promise.all([
    supabase
      .from("user_shows")
      .select("show_id, show_name, poster_path")
      .eq("user_id", user.id)
      .order("last_watched_at", { ascending: false })
      .limit(40),
    supabase
      .from("watched_episodes")
      .select("show_id, season_number, episode_number")
      .eq("user_id", user.id),
  ]);

  if (!userShows?.length) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <CalendarCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Nenhuma série ainda</h1>
          <p className="text-muted-foreground text-sm">
            Marque episódios como assistidos para acompanhar seu progresso aqui.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Explorar séries
          </Link>
        </main>
      </div>
    );
  }

  const watchedMap = new Map<number, Set<string>>();
  for (const ep of watchedEps ?? []) {
    if (!watchedMap.has(ep.show_id)) watchedMap.set(ep.show_id, new Set());
    watchedMap.get(ep.show_id)!.add(`${ep.season_number}:${ep.episode_number}`);
  }

  const showDetails = await Promise.all(
    userShows.map((s) => getTVShow(s.show_id).catch(() => null))
  );

  const seasonFetchJobs: { showIdx: number; showId: number; seasonNumber: number }[] = [];

  for (let i = 0; i < showDetails.length; i++) {
    const detail = showDetails[i];
    if (!detail) continue;
    const watched = watchedMap.get(detail.id) ?? new Set<string>();
    const realSeasons = detail.seasons.filter(
      (s) => s.season_number > 0 && s.episode_count > 0
    );
    for (const season of realSeasons) {
      const seasonWatchedCount = [...watched].filter((k) =>
        k.startsWith(`${season.season_number}:`)
      ).length;
      if (seasonWatchedCount < season.episode_count) {
        seasonFetchJobs.push({
          showIdx: i,
          showId: detail.id,
          seasonNumber: season.season_number,
        });
        break;
      }
    }
  }

  const seasonResults = await Promise.all(
    seasonFetchJobs.map((job) =>
      getSeason(job.showId, job.seasonNumber).catch(() => null)
    )
  );

  const seasonByShowIdx = new Map(
    seasonFetchJobs.map((job, i) => [job.showIdx, seasonResults[i]])
  );

  const items: WatchlistItem[] = [];

  for (let i = 0; i < showDetails.length; i++) {
    const detail = showDetails[i];
    if (!detail) continue;
    const userShow = userShows[i];
    const watched = watchedMap.get(detail.id) ?? new Set<string>();
    const realSeasons = detail.seasons.filter(
      (s) => s.season_number > 0 && s.episode_count > 0
    );
    const totalEpisodes = realSeasons.reduce((acc, s) => acc + s.episode_count, 0);
    const watchedCount = watched.size;

    if (watchedCount >= totalEpisodes && totalEpisodes > 0) continue;

    const seasonDetail = seasonByShowIdx.get(i);
    const nextEpisode: Episode | null =
      seasonDetail?.episodes.find(
        (ep) => !watched.has(`${ep.season_number}:${ep.episode_number}`)
      ) ?? null;

    items.push({
      showId: detail.id,
      showName: detail.name,
      posterPath: userShow.poster_path,
      inProduction: detail.in_production,
      totalEpisodes,
      watchedCount,
      nextEpisode,
    });
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">A Assistir</h1>
          {items.length > 0 && (
            <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {items.length} {items.length === 1 ? "série" : "séries"}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center gap-3">
            <CalendarCheck className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              Tudo em dia! Explore novas séries.
            </p>
            <Link
              href="/"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Explorar
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <WatchlistCard key={item.showId} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
