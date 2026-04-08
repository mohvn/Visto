import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTVShow, getSeason, posterUrl } from "@/lib/tmdb";
import { Header } from "@/components/header";
import { EpisodeRow } from "@/components/episode-row";
import { SeasonActions } from "@/components/season-actions";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

interface SeasonPageProps {
  params: Promise<{ id: string; seasonNumber: string }>;
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { id, seasonNumber: sn } = await params;
  const showId = parseInt(id, 10);
  const seasonNumber = parseInt(sn, 10);
  if (isNaN(showId) || isNaN(seasonNumber)) notFound();

  const [show, season] = await Promise.all([
    getTVShow(showId),
    getSeason(showId, seasonNumber),
  ]);

  const poster = posterUrl(season.poster_path, "w185");
  const episodeNumbers = season.episodes.map((e) => e.episode_number);
  const episodeRuntimes: Record<number, number> = {};
  for (const ep of season.episodes) {
    if (ep.runtime) episodeRuntimes[ep.episode_number] = ep.runtime;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <Link
          href={`/show/${showId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {show.name}
        </Link>

        <div className="flex gap-4">
          {poster && (
            <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-md border border-border">
              <Image
                src={poster}
                alt={season.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-xl font-bold">{season.name}</h1>
            <p className="text-sm text-muted-foreground">
              {season.episodes.length} episódios
              {season.air_date && (
                <span> · {season.air_date.split("-")[0]}</span>
              )}
            </p>
            {season.overview && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {season.overview}
              </p>
            )}
          </div>
        </div>

        <SeasonActions
          showId={showId}
          seasonNumber={seasonNumber}
          episodeNumbers={episodeNumbers}
          episodeRuntimes={episodeRuntimes}
          showName={show.name}
          posterPath={show.poster_path}
        />

        <Separator />

        <div className="space-y-2">
          {season.episodes.map((episode) => (
            <EpisodeRow
              key={episode.id}
              episode={episode}
              showId={showId}
              showName={show.name}
              posterPath={show.poster_path}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
