import Image from "next/image";
import Link from "next/link";
import { posterUrl, type TVShow } from "@/lib/tmdb";

interface ShowCardProps {
  show: TVShow;
}

export function ShowCard({ show }: ShowCardProps) {
  const poster = posterUrl(show.poster_path, "w342");
  const year = show.first_air_date?.split("-")[0];

  return (
    <Link
      href={`/show/${show.id}`}
      className="group block overflow-hidden rounded-lg bg-card border border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {poster ? (
          <Image
            src={poster}
            alt={show.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <span className="text-sm">Sem poster</span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {show.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {year && <span>{year}</span>}
          {show.vote_average > 0 && (
            <span className="flex items-center gap-1">
              <Image src="/imdb-logo.svg" alt="IMDb" width={28} height={14} className="inline-block" />
              {show.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
