"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Clock } from "lucide-react";
import { stillUrl, type Episode } from "@/lib/tmdb";
import { useWatched } from "@/hooks/use-watched";
import { EpisodeReviewDialog } from "@/components/episode-review-dialog";
import { EpisodeCommentsDialog } from "@/components/episode-comments-dialog";
import { cn } from "@/lib/utils";

interface EpisodeRowProps {
  episode: Episode;
  showId: number;
  showName: string;
  posterPath: string | null;
}

export function EpisodeRow({ episode, showId, showName, posterPath }: EpisodeRowProps) {
  const { isWatched, toggleWatched } = useWatched();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const key = {
    showId,
    seasonNumber: episode.season_number,
    episodeNumber: episode.episode_number,
  };

  const watched = isWatched(key);
  const still = stillUrl(episode.still_path);

  return (
    <>
      <div
        className={cn(
          "group flex gap-3 rounded-lg border border-border p-3 transition-all cursor-pointer select-none",
          watched
            ? "bg-primary/5 border-primary/20"
            : "hover:border-primary/30 hover:bg-card"
        )}
        onClick={() => setReviewOpen(true)}
      >
        {/* Thumbnail */}
        <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-md bg-muted">
          {still ? (
            <Image
              src={still}
              alt={episode.name}
              fill
              sizes="144px"
              className={cn(
                "object-cover transition-opacity",
                watched && "opacity-60"
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
              Ep {episode.episode_number}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4
                className={cn(
                  "font-medium text-sm leading-tight",
                  watched && "text-muted-foreground"
                )}
              >
                <span className="text-primary font-mono text-xs mr-1.5">
                  E{String(episode.episode_number).padStart(2, "0")}
                </span>
                {episode.name}
              </h4>
              {episode.air_date && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(episode.air_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  {episode.runtime && (
                    <span className="ml-2 inline-flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {episode.runtime}min
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Check button — stopPropagation so it doesn't open the dialog */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatched(key, {
                  runtime: episode.runtime ?? undefined,
                  showName,
                  posterPath,
                });
              }}
              className={cn(
                "shrink-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                watched
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-transparent hover:border-primary hover:text-primary"
              )}
              aria-label={watched ? "Marcar como não assistido" : "Marcar como assistido"}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          {episode.overview && (
            <p
              className={cn(
                "text-xs text-muted-foreground line-clamp-2",
                watched && "opacity-60"
              )}
            >
              {episode.overview}
            </p>
          )}
        </div>
      </div>

      <EpisodeReviewDialog
        episode={episode}
        showId={showId}
        showName={showName}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onOpenComments={() => {
          setReviewOpen(false);
          setCommentsOpen(true);
        }}
      />

      <EpisodeCommentsDialog
        episode={episode}
        showId={showId}
        showName={showName}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        isWatched={watched}
      />
    </>
  );
}
