"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  isWatched as checkWatchedLocal,
  toggleWatched as toggleLocal,
  markSeasonWatched as markSeasonLocal,
  getWatchedCountForSeason as getSeasonCountLocal,
  getWatchedCountForShow as getShowCountLocal,
  type WatchedKey,
} from "@/lib/watched";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";

const listeners = new Set<() => void>();
let version = 0;

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  version++;
  listeners.forEach((cb) => cb());
}

function getSnapshot() {
  return version;
}

function getServerSnapshot() {
  return 0;
}

const watchedCache = new Map<string, boolean>();
/** Last user id we successfully hydrated into `watchedCache`. */
let cacheLoadedForUserId: string | null = null;
/** Synchronously updated by the effect — used to drop stale /api/watched responses on fast user switches. */
let desiredUserId: string | null = null;
/** One in-flight load per user id (dedupes Strict Mode + many useWatched() instances). */
const loadPromises = new Map<string, Promise<void>>();

function cacheKey(k: WatchedKey) {
  return `${k.showId}:${k.seasonNumber}:${k.episodeNumber}`;
}

export interface ShowMeta {
  showName: string;
  posterPath: string | null;
}

export interface ToggleOptions extends ShowMeta {
  runtime?: number;
}

export interface MarkSeasonOptions extends ShowMeta {
  runtimes?: Record<number, number>;
}

function ensureWatchedCacheLoaded(userId: string): Promise<void> {
  if (cacheLoadedForUserId === userId) return Promise.resolve();

  let p = loadPromises.get(userId);
  if (!p) {
    p = api.watched
      .load()
      .then((data) => {
        if (desiredUserId !== userId) return;
        watchedCache.clear();
        for (const row of data) {
          watchedCache.set(
            cacheKey({
              showId: row.show_id,
              seasonNumber: row.season_number,
              episodeNumber: row.episode_number,
            }),
            true
          );
        }
        cacheLoadedForUserId = userId;
        notify();
      })
      .finally(() => {
        loadPromises.delete(userId);
      });
    loadPromises.set(userId, p);
  }
  return p;
}

export function useWatched() {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const userId = useAuth().user?.id ?? null;

  useEffect(() => {
    desiredUserId = userId;

    if (!userId) {
      if (cacheLoadedForUserId !== null || watchedCache.size > 0) {
        watchedCache.clear();
        cacheLoadedForUserId = null;
        notify();
      }
      return;
    }

    if (cacheLoadedForUserId === userId) return;

    if (cacheLoadedForUserId !== null && cacheLoadedForUserId !== userId) {
      watchedCache.clear();
      cacheLoadedForUserId = null;
      notify();
    }

    void ensureWatchedCacheLoaded(userId);
  }, [userId]);

  const isWatched = useCallback(
    (k: WatchedKey) => {
      if (userId) return watchedCache.has(cacheKey(k));
      return checkWatchedLocal(k);
    },
    [userId]
  );

  const toggleWatched = useCallback(
    async (k: WatchedKey, opts?: ToggleOptions) => {
      if (!userId) {
        const result = toggleLocal(k);
        notify();
        return result;
      }

      const key = cacheKey(k);
      const wasWatched = watchedCache.has(key);

      if (wasWatched) {
        watchedCache.delete(key);
        notify();
        await api.watched.remove({
          showId: k.showId,
          seasonNumber: k.seasonNumber,
          episodeNumber: k.episodeNumber,
        });
      } else {
        watchedCache.set(key, true);
        notify();
        await api.watched.add({
          showId: k.showId,
          seasonNumber: k.seasonNumber,
          episodeNumber: k.episodeNumber,
          runtime: opts?.runtime,
          showName: opts?.showName,
          posterPath: opts?.posterPath,
        });
      }

      return !wasWatched;
    },
    [userId]
  );

  const markSeasonWatched = useCallback(
    async (
      showId: number,
      seasonNumber: number,
      episodes: number[],
      watched: boolean,
      opts?: MarkSeasonOptions
    ) => {
      if (!userId) {
        markSeasonLocal(showId, seasonNumber, episodes, watched);
        notify();
        return;
      }

      if (watched) {
        for (const ep of episodes) {
          watchedCache.set(
            cacheKey({ showId, seasonNumber, episodeNumber: ep }),
            true
          );
        }
        notify();

        await api.watched.markSeason({
          showId,
          seasonNumber,
          episodes,
          runtimes: opts?.runtimes,
          showName: opts?.showName,
          posterPath: opts?.posterPath,
        });
      } else {
        for (const ep of episodes) {
          watchedCache.delete(
            cacheKey({ showId, seasonNumber, episodeNumber: ep })
          );
        }
        notify();

        await api.watched.unmarkSeason({ showId, seasonNumber, episodes });
      }
    },
    [userId]
  );

  const seasonProgress = useCallback(
    (showId: number, seasonNumber: number, totalEpisodes: number) => {
      if (!userId)
        return getSeasonCountLocal(showId, seasonNumber, totalEpisodes);

      let count = 0;
      for (let ep = 1; ep <= totalEpisodes; ep++) {
        if (
          watchedCache.has(
            cacheKey({ showId, seasonNumber, episodeNumber: ep })
          )
        ) {
          count++;
        }
      }
      return count;
    },
    [userId]
  );

  const showProgress = useCallback(
    (
      showId: number,
      seasons: { seasonNumber: number; episodeCount: number }[]
    ) => {
      if (!userId) return getShowCountLocal(showId, seasons);

      let count = 0;
      for (const s of seasons) {
        for (let ep = 1; ep <= s.episodeCount; ep++) {
          if (
            watchedCache.has(
              cacheKey({
                showId,
                seasonNumber: s.seasonNumber,
                episodeNumber: ep,
              })
            )
          ) {
            count++;
          }
        }
      }
      return count;
    },
    [userId]
  );

  return {
    isWatched,
    toggleWatched,
    markSeasonWatched,
    seasonProgress,
    showProgress,
  };
}
