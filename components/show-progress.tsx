"use client";

import { useWatched } from "@/hooks/use-watched";
import { Progress } from "@/components/ui/progress";

interface ShowProgressProps {
  showId: number;
  seasons: { seasonNumber: number; episodeCount: number }[];
  totalEpisodes: number;
}

export function ShowProgress({
  showId,
  seasons,
  totalEpisodes,
}: ShowProgressProps) {
  const { showProgress } = useWatched();
  const watched = showProgress(showId, seasons);
  const pct = totalEpisodes > 0 ? (watched / totalEpisodes) * 100 : 0;

  if (watched === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progresso</span>
        <span className="font-mono text-primary font-medium">
          {watched}/{totalEpisodes}
        </span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
}
