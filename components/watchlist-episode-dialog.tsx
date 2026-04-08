"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useWatched, type ToggleOptions } from "@/hooks/use-watched";
import { stillUrl, type Episode } from "@/lib/tmdb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EpisodeCommentsDialog } from "@/components/episode-comments-dialog";
import { Check, Clock, Eye, Loader2, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { value: "netflix", label: "Netflix", color: "bg-red-600" },
  { value: "hbo", label: "Max", color: "bg-violet-600" },
  { value: "disney", label: "Disney+", color: "bg-blue-600" },
  { value: "prime", label: "Prime Video", color: "bg-cyan-600" },
  { value: "apple", label: "Apple TV+", color: "bg-neutral-600" },
  { value: "paramount", label: "Paramount+", color: "bg-blue-500" },
  { value: "crunchyroll", label: "Crunchyroll", color: "bg-orange-500" },
  { value: "globoplay", label: "Globoplay", color: "bg-red-500" },
  { value: "star", label: "Star+", color: "bg-amber-700" },
  { value: "outro", label: "Outro", color: "bg-muted" },
];

interface WatchlistEpisodeDialogProps {
  episode: Episode;
  showId: number;
  showName: string;
  posterPath: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WatchlistEpisodeDialog({
  episode,
  showId,
  showName,
  posterPath,
  open,
  onOpenChange,
}: WatchlistEpisodeDialogProps) {
  const { isWatched, toggleWatched } = useWatched();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [watchedOn, setWatchedOn] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [marking, setMarking] = useState(false);

  const latestRef = useRef({ rating, watchedOn });
  latestRef.current = { rating, watchedOn };
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const key = {
    showId,
    seasonNumber: episode.season_number,
    episodeNumber: episode.episode_number,
  };
  const watched = isWatched(key);
  const still = stillUrl(episode.still_path, "w500");

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setWatchedOn("");
    setJustSaved(false);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !watched) return;
    api.reviews
      .get(showId, episode.season_number, episode.episode_number)
      .then((data) => {
        setRating(data.rating ?? 0);
        setWatchedOn(data.watched_on ?? "");
      })
      .catch(() => {});
  }, [open, watched, showId, episode.season_number, episode.episode_number]);

  async function handleMarkWatched() {
    setMarking(true);
    const opts: ToggleOptions = {
      runtime: episode.runtime ?? undefined,
      showName,
      posterPath,
    };
    await toggleWatched(key, opts);
    setMarking(false);
  }

  function triggerSave(newRating: number, newWatchedOn: string) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaving(true);
    setJustSaved(false);
    saveTimerRef.current = setTimeout(async () => {
      await api.reviews.save({
        showId,
        seasonNumber: episode.season_number,
        episodeNumber: episode.episode_number,
        rating: newRating || null,
        watchedOn: newWatchedOn || null,
      });
      setSaving(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    }, 400);
  }

  function handleRating(star: number) {
    const next = star === rating ? 0 : star;
    setRating(next);
    triggerSave(next, latestRef.current.watchedOn);
  }

  function handlePlatform(value: string) {
    const next = watchedOn === value ? "" : value;
    setWatchedOn(next);
    triggerSave(latestRef.current.rating, next);
  }

  const displayRating = hoverRating || rating;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          {still && (
            <div className="relative h-44 w-full overflow-hidden">
              <Image src={still} alt={episode.name} fill sizes="500px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-popover via-popover/40 to-transparent" />
            </div>
          )}

          <div className={cn("px-6 pb-6 space-y-5", still ? "-mt-10 relative" : "pt-6")}>
            <DialogHeader className="text-left space-y-1">
              <p className="text-xs text-muted-foreground">
                {showName} · S{String(episode.season_number).padStart(2, "0")}E
                {String(episode.episode_number).padStart(2, "0")}
              </p>
              <DialogTitle className="text-lg leading-tight">{episode.name}</DialogTitle>
              {episode.air_date && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {new Date(episode.air_date + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {episode.runtime && (
                    <>
                      <span className="text-border">·</span>
                      <Clock className="h-3 w-3" />
                      {episode.runtime} min
                    </>
                  )}
                </p>
              )}
            </DialogHeader>

            {episode.overview && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                {episode.overview}
              </p>
            )}

            {!watched ? (
              <Button onClick={handleMarkWatched} disabled={marking} className="w-full cursor-pointer" size="lg">
                {marking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                Marcar como visto
              </Button>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  Assistido!
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-primary" />
                      Avaliação
                    </label>
                    <span className={cn(
                      "text-xs transition-opacity duration-300 flex items-center gap-1",
                      saving ? "opacity-100 text-muted-foreground" : justSaved ? "opacity-100 text-primary" : "opacity-0"
                    )}>
                      {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      {saving ? "Salvando…" : "Salvo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => handleRating(star)}
                        onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)}
                        className="p-0.5 transition-transform hover:scale-110 cursor-pointer">
                        <Star className={cn("h-7 w-7 transition-colors",
                          star <= displayRating ? "fill-primary text-primary" : "text-muted-foreground/30")} />
                      </button>
                    ))}
                    {displayRating > 0 && (
                      <span className="ml-2 text-sm font-mono text-primary">{displayRating}/5</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Onde assistiu?</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <button key={p.value} onClick={() => handlePlatform(p.value)}
                        className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                          watchedOn === p.value
                            ? `${p.color} text-white ring-2 ring-primary/50 shadow-md`
                            : "bg-secondary text-muted-foreground hover:text-foreground")}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button variant="outline" onClick={() => { onOpenChange(false); setTimeout(() => setCommentsOpen(true), 150); }}
                  className="w-full cursor-pointer">
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Ver comentários
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
