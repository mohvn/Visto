"use client";

import { useWatched } from "@/hooks/use-watched";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCheck, RotateCcw } from "lucide-react";

interface SeasonActionsProps {
  showId: number;
  seasonNumber: number;
  episodeNumbers: number[];
  episodeRuntimes: Record<number, number>;
  showName: string;
  posterPath: string | null;
}

export function SeasonActions({
  showId,
  seasonNumber,
  episodeNumbers,
  episodeRuntimes,
  showName,
  posterPath,
}: SeasonActionsProps) {
  const { seasonProgress, markSeasonWatched } = useWatched();
  const total = episodeNumbers.length;
  const watched = seasonProgress(showId, seasonNumber, total);
  const allWatched = watched === total && total > 0;
  const pct = total > 0 ? (watched / total) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progresso da temporada
            </span>
            <span className="font-mono text-primary font-medium">
              {watched}/{total}
            </span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <Button
          size="sm"
          variant={allWatched ? "outline" : "default"}
          onClick={() =>
            markSeasonWatched(
              showId,
              seasonNumber,
              episodeNumbers,
              !allWatched,
              { runtimes: episodeRuntimes, showName, posterPath }
            )
          }
          className="shrink-0"
        >
          {allWatched ? (
            <>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Desmarcar
            </>
          ) : (
            <>
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Marcar tudo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
