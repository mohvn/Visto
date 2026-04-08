"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { stillUrl, type Episode } from "@/lib/tmdb";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Clock, Loader2, MessageSquare, Star } from "lucide-react";
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

interface EpisodeReviewDialogProps {
  episode: Episode;
  showId: number;
  showName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenComments?: () => void;
}

export function EpisodeReviewDialog({
  episode,
  showId,
  showName,
  open,
  onOpenChange,
  onOpenComments,
}: EpisodeReviewDialogProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [watchedOn, setWatchedOn] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const latestRef = useRef({ rating, watchedOn });
  latestRef.current = { rating, watchedOn };

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const still = stillUrl(episode.still_path, "w500");

  useEffect(() => {
    if (!open || !user) return;

    setLoading(true);
    setJustSaved(false);

    api.reviews
      .get(showId, episode.season_number, episode.episode_number)
      .then((data) => {
        setRating(data.rating ?? 0);
        setWatchedOn(data.watched_on ?? "");
      })
      .catch(() => {
        setRating(0);
        setWatchedOn("");
      })
      .finally(() => setLoading(false));

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [open, user, showId, episode.season_number, episode.episode_number]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {still && (
          <div className="relative h-44 w-full overflow-hidden">
            <Image
              src={still}
              alt={episode.name}
              fill
              sizes="500px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-popover via-popover/40 to-transparent" />
          </div>
        )}

        <div className={cn("px-6 pb-6 space-y-5", still ? "-mt-10 relative" : "pt-6")}>
          <DialogHeader className="text-left space-y-1">
            <p className="text-xs text-muted-foreground">
              {showName} · S{String(episode.season_number).padStart(2, "0")}E
              {String(episode.episode_number).padStart(2, "0")}
            </p>
            <DialogTitle className="text-lg leading-tight">
              {episode.name}
            </DialogTitle>
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
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {episode.overview}
            </p>
          )}

          {!user && !loading ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                Faça login para avaliar
              </div>
              {onOpenComments && (
                <Button variant="outline" onClick={onOpenComments} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Ver comentários
                </Button>
              )}
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Star rating */}
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
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    {saving ? "Salvando…" : "Salvo"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-7 w-7 transition-colors",
                          star <= displayRating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                  {displayRating > 0 && (
                    <span className="ml-2 text-sm font-mono text-primary">
                      {displayRating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Onde assistiu?</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => handlePlatform(p.value)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                        watchedOn === p.value
                          ? `${p.color} text-white ring-2 ring-primary/50 shadow-md`
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comments button */}
              {onOpenComments && (
                <Button variant="outline" onClick={onOpenComments} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Ver comentários
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
