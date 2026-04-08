"use client";

import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { useDragScroll } from "@/hooks/use-drag-scroll";

interface ShowItem {
  show_id: number;
  show_name: string;
  poster_path: string | null;
}

interface ShowScrollProps {
  shows: ShowItem[];
}

export function ShowScroll({ shows }: ShowScrollProps) {
  const drag = useDragScroll<HTMLDivElement>();

  if (shows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground rounded-2xl border border-dashed border-border">
        Nenhuma série ainda
      </div>
    );
  }

  return (
    <div
      ref={drag.ref}
      {...drag.bind}
      className="flex gap-3.5 overflow-x-auto pb-3 -mx-1 px-1 cursor-grab active:cursor-grabbing select-none"
    >
      {shows.map((show) => {
        const poster = posterUrl(show.poster_path, "w342");
        return (
          <Link
            key={show.show_id}
            href={`/show/${show.show_id}`}
            className="group shrink-0 select-none"
          >
            <div className="relative h-80 w-52 overflow-hidden rounded-xl bg-muted border border-border transition-all group-hover:border-primary/50 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:-translate-y-1">
              {poster ? (
                <Image
                  src={poster}
                  alt={show.show_name}
                  fill
                  sizes="144px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                  {show.show_name}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs font-medium text-center truncate max-w-36 text-muted-foreground group-hover:text-foreground transition-colors">
              {show.show_name}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
