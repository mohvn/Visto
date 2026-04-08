export interface WatchedKey {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
}

const STORAGE_KEY = "visto-watched";

function getAll(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function toKey(k: WatchedKey): string {
  return `${k.showId}:${k.seasonNumber}:${k.episodeNumber}`;
}

export function isWatched(k: WatchedKey): boolean {
  return !!getAll()[toKey(k)];
}

export function toggleWatched(k: WatchedKey): boolean {
  const all = getAll();
  const key = toKey(k);
  const next = !all[key];
  if (next) {
    all[key] = true;
  } else {
    delete all[key];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return next;
}

export function markSeasonWatched(
  showId: number,
  seasonNumber: number,
  episodes: number[],
  watched: boolean
): void {
  const all = getAll();
  for (const ep of episodes) {
    const key = toKey({ showId, seasonNumber, episodeNumber: ep });
    if (watched) {
      all[key] = true;
    } else {
      delete all[key];
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getWatchedCountForSeason(
  showId: number,
  seasonNumber: number,
  totalEpisodes: number
): number {
  const all = getAll();
  let count = 0;
  for (let ep = 1; ep <= totalEpisodes; ep++) {
    if (all[toKey({ showId, seasonNumber, episodeNumber: ep })]) {
      count++;
    }
  }
  return count;
}

export function getWatchedCountForShow(
  showId: number,
  seasons: { seasonNumber: number; episodeCount: number }[]
): number {
  const all = getAll();
  let count = 0;
  for (const s of seasons) {
    for (let ep = 1; ep <= s.episodeCount; ep++) {
      if (
        all[toKey({ showId, seasonNumber: s.seasonNumber, episodeNumber: ep })]
      ) {
        count++;
      }
    }
  }
  return count;
}
