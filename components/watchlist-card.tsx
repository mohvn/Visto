"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { posterUrl, stillUrl, type Episode } from "@/lib/tmdb";
import { useWatched } from "@/hooks/use-watched";
import { WatchlistEpisodeDialog } from "@/components/watchlist-episode-dialog";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";

export interface WatchlistItem {
  showId: number;
  showName: string;
  posterPath: string | null;
  inProduction: boolean;
  totalEpisodes: number;
  watchedCount: number;
  nextEpisode: Episode | null;
}

export function WatchlistCard({ item }: { item: WatchlistItem }) {
  const router = useRouter();
  const { isWatched } = useWatched();
  const [dialogOpen, setDialogOpen] = useState(false);
  const wasWatchedOnOpen = useRef(false);

  const nextEpWatched = item.nextEpisode
    ? isWatched({
        showId: item.showId,
        seasonNumber: item.nextEpisode.season_number,
        episodeNumber: item.nextEpisode.episode_number,
      })
    : false;

  const poster = posterUrl(item.posterPath, "w185");
  const still = item.nextEpisode ? stillUrl(item.nextEpisode.still_path, "w300") : null;
  const progress =
    item.totalEpisodes > 0
      ? Math.round((item.watchedCount / item.totalEpisodes) * 100)
      : 0;

  function handleOpenChange(open: boolean) {
    if (open) {
      wasWatchedOnOpen.current = nextEpWatched;
    }
    setDialogOpen(open);
    if (!open && nextEpWatched && !wasWatchedOnOpen.current) {
      router.refresh();
    }
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30">
        <div className="flex gap-0">
          {/* Poster */}
          <Link href={`/show/${item.showId}`} className="shrink-0">
            <div className="relative h-full w-20 sm:w-24 min-h-[120px] bg-muted">
              {poster ? (
                <Image
                  src={poster}
                  alt={item.showName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                  {item.showName}
                </div>
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/show/${item.showId}`}>
                <h3 className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
                  {item.showName}
                </h3>
              </Link>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  item.inProduction
                    ? "bg-green-500/10 text-green-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {item.inProduction ? "Em exibição" : "Finalizada"}
              </span>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {item.watchedCount} / {item.totalEpisodes} ep
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Next episode — opens dialog */}
            {item.nextEpisode && (
              <button
                onClick={() => handleOpenChange(true)}
                className="flex w-full items-center gap-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors p-2 text-left cursor-pointer group"
              >
                {still && (
                  <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={still}
                      alt={item.nextEpisode.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-primary font-mono font-semibold">
                    S{String(item.nextEpisode.season_number).padStart(2, "0")}E
                    {String(item.nextEpisode.episode_number).padStart(2, "0")}
                  </p>
                  <p className="text-xs font-medium truncate">
                    {item.nextEpisode.name}
                  </p>
                </div>
                <Play className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </button>
            )}
          </div>
        </div>
      </div>

      {item.nextEpisode && (
        <WatchlistEpisodeDialog
          episode={item.nextEpisode}
          showId={item.showId}
          showName={item.showName}
          posterPath={item.posterPath}
          open={dialogOpen}
          onOpenChange={handleOpenChange}
        />
      )}
    </>
  );
}
