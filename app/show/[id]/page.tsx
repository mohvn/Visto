import Image from "next/image";
import { notFound } from "next/navigation";
import { getTVShow, posterUrl, backdropUrl } from "@/lib/tmdb";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { SeasonCard } from "@/components/season-card";
import { ShowProgress } from "@/components/show-progress";
import { FavoriteButton } from "@/components/favorite-button";
import { AddToListButton } from "@/components/add-to-list-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Flame, Tv, Users } from "lucide-react";

interface ShowPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowPage({ params }: ShowPageProps) {
  const { id } = await params;
  const showId = parseInt(id, 10);
  if (isNaN(showId)) notFound();

  const supabase = await createClient();
  const [show, trackerResult] = await Promise.all([
    getTVShow(showId),
    supabase.rpc("get_show_tracker_count", { p_show_id: showId }),
  ]);

  const trackerCount: number = trackerResult.data ?? 0;

  const poster = posterUrl(show.poster_path);
  const backdrop = backdropUrl(show.backdrop_path);

  const seasons = show.seasons.filter((s) => s.season_number > 0);
  const seasonData = seasons.map((s) => ({
    seasonNumber: s.season_number,
    episodeCount: s.episode_count,
  }));

  return (
    <div className="min-h-screen">
      <Header />

      {backdrop && (
        <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden">
          <Image
            src={backdrop}
            alt={show.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex flex-col sm:flex-row gap-6 ${backdrop ? "-mt-32 relative z-10" : "mt-8"}`}
        >
          {poster && (
            <div className="relative h-64 w-44 shrink-0 overflow-hidden rounded-lg border-2 border-primary/20 shadow-lg self-center sm:self-start">
              <Image
                src={poster}
                alt={show.name}
                fill
                priority
                sizes="176px"
                className="object-cover"
              />
            </div>
          )}

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{show.name}</h1>
              {show.tagline && (
                <p className="text-sm text-primary italic mt-1">
                  {show.tagline}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {show.genres.map((g) => (
                <Badge key={g.id} variant="secondary" className="text-xs">
                  {g.name}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {show.first_air_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {show.first_air_date.split("-")[0]}
                  {show.last_air_date &&
                    show.last_air_date !== show.first_air_date &&
                    `–${show.last_air_date.split("-")[0]}`}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Tv className="h-3.5 w-3.5" />
                {show.number_of_seasons} temp. · {show.number_of_episodes} ep.
              </span>
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1.5">
                  <Image src="/imdb-logo.svg" alt="IMDb" width={32} height={16} />
                  {show.vote_average.toFixed(1)}
                </span>
              )}
              {(() => {
                const isReturning = show.status === "Returning Series";
                const isEnded = show.status === "Ended";
                const isCanceled = show.status === "Canceled";
                const label = isReturning
                  ? "Em exibição"
                  : isEnded
                    ? "Finalizada"
                    : isCanceled
                      ? "Cancelada"
                      : show.status;

                return (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${isReturning
                        ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                        : isCanceled
                          ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
                          : "bg-muted text-muted-foreground ring-1 ring-border"
                      }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isReturning
                          ? "bg-emerald-400 animate-pulse"
                          : isCanceled
                            ? "bg-red-400"
                            : "bg-muted-foreground"
                        }`}
                    />
                    {label}
                  </span>
                );
              })()}
              {trackerCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide bg-primary/15 text-primary ring-1 ring-primary/30">
                  {trackerCount >= 10 ? (
                    <Flame className="h-3 w-3" />
                  ) : (
                    <Users className="h-3 w-3" />
                  )}
                  {trackerCount} {trackerCount === 1 ? "pessoa acompanha" : "pessoas acompanham"}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <FavoriteButton
                showId={show.id}
                showName={show.name}
                posterPath={show.poster_path}
              />
              <AddToListButton
                showId={show.id}
                showName={show.name}
                posterPath={show.poster_path}
              />
            </div>

            {show.overview && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {show.overview}
              </p>
            )}

            {show.created_by.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Criado por: {show.created_by.map((c) => c.name).join(", ")}
              </p>
            )}

            <ShowProgress
              showId={show.id}
              seasons={seasonData}
              totalEpisodes={show.number_of_episodes}
            />
          </div>
        </div>

        <Separator className="my-8" />

        <section className="pb-12">
          <h2 className="text-lg font-bold mb-4">Temporadas</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {seasons.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                showId={show.id}
                showName={show.name}
                showPosterPath={show.poster_path}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
