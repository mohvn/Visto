"use client";

import Image from "next/image";
import Link from "next/link";
import { posterUrl, type Season } from "@/lib/tmdb";
import { useWatched } from "@/hooks/use-watched";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeasonCardProps {
  season: Season;
  showId: number;
  showName: string;
  showPosterPath: string | null;
}

export function SeasonCard({ season, showId, showName, showPosterPath }: SeasonCardProps) {
  const { seasonProgress, markSeasonWatched } = useWatched();
  const poster = posterUrl(season.poster_path, "w185");
  const watched = seasonProgress(showId, season.season_number, season.episode_count);
  const pct =
    season.episode_count > 0 ? (watched / season.episode_count) * 100 : 0;
  const allWatched = watched === season.episode_count && season.episode_count > 0;

  const episodes = Array.from({ length: season.episode_count }, (_, i) => i + 1);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    markSeasonWatched(showId, season.season_number, episodes, !allWatched, {
      showName,
      posterPath: showPosterPath,
    });
  }

  return (
    <Link
      href={`/show/${showId}/season/${season.season_number}`}
      className="group flex gap-4 rounded-lg border border-border p-3 transition-all hover:border-primary/50 hover:bg-card"
    >
      <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {poster ? (
          <Image
            src={poster}
            alt={season.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs text-center px-1">
            {season.name}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {season.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {season.episode_count} episódios
              {season.air_date && (
                <span className="ml-1">
                  · {season.air_date.split("-")[0]}
                </span>
              )}
            </p>
          </div>

          <button
            onClick={handleToggle}
            className={cn(
              "shrink-0 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all",
              allWatched
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/30 text-transparent hover:border-primary hover:text-primary"
            )}
            aria-label={allWatched ? "Desmarcar temporada" : "Marcar temporada como vista"}
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Assistidos</span>
            <span className="font-mono text-primary">
              {watched}/{season.episode_count}
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </div>
    </Link>
  );
}
