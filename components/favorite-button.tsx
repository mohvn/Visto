"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  showId: number;
  showName: string;
  posterPath: string | null;
}

export function FavoriteButton({
  showId,
  showName,
  posterPath,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.favorites
      .check(showId)
      .then((fav) => setIsFavorite(fav))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [showId]);

  async function toggle() {
    if (isFavorite) {
      setIsFavorite(false);
      await api.favorites.remove(showId);
    } else {
      setIsFavorite(true);
      await api.favorites.add({ showId, showName, posterPath });
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
        isFavorite
          ? "bg-primary/10 text-primary"
          : "bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10"
      )}
    >
      <Heart
        className={cn("h-4 w-4", isFavorite && "fill-primary text-primary")}
      />
      {isFavorite ? "Favorito" : "Favoritar"}
    </button>
  );
}
