import axios from "axios";

const http = axios.create({ baseURL: "/api" });

export interface WatchedEpisode {
  show_id: number;
  season_number: number;
  episode_number: number;
}

export interface ToggleWatchedPayload {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  runtime?: number;
  showName?: string;
  posterPath?: string | null;
}

export interface MarkSeasonPayload {
  showId: number;
  seasonNumber: number;
  episodes: number[];
  runtimes?: Record<number, number>;
  showName?: string;
  posterPath?: string | null;
}

export interface CommentPayload {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  parentId?: string | null;
  content: string;
}

export interface CommentData {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  username: string | null;
  likes_count: number;
  liked_by_me: boolean;
}

export interface CommentsResponse {
  comments: CommentData[];
  userId: string | null;
}

export interface ReviewData {
  rating: number | null;
  watched_on: string | null;
}

export interface ReviewPayload {
  showId: number;
  seasonNumber: number;
  episodeNumber: number;
  rating: number | null;
  watchedOn: string | null;
}

export interface ListData {
  id: string;
  name: string;
  has_show?: boolean;
}

export interface CreateListPayload {
  name: string;
  showId?: number;
  showName?: string;
  posterPath?: string | null;
}

export interface ListItemPayload {
  showId: number;
  showName: string;
  posterPath: string | null;
}

export const api = {
  watched: {
    load: () =>
      http.get<WatchedEpisode[]>("/watched").then((r) => r.data),

    add: (data: ToggleWatchedPayload) =>
      http.post("/watched", data).then((r) => r.data),

    remove: (data: Pick<ToggleWatchedPayload, "showId" | "seasonNumber" | "episodeNumber">) =>
      http.delete("/watched", { data }).then((r) => r.data),

    markSeason: (data: MarkSeasonPayload) =>
      http.post("/watched/season", data).then((r) => r.data),

    unmarkSeason: (data: Pick<MarkSeasonPayload, "showId" | "seasonNumber" | "episodes">) =>
      http.delete("/watched/season", { data }).then((r) => r.data),
  },

  comments: {
    list: (showId: number, season: number, episode: number) =>
      http
        .get<CommentsResponse>("/comments", {
          params: { showId, season, episode },
        })
        .then((r) => r.data),

    create: (data: CommentPayload) =>
      http.post("/comments", data).then((r) => r.data),

    delete: (commentId: string) =>
      http.delete(`/comments/${commentId}`).then((r) => r.data),

    toggleLike: (commentId: string) =>
      http.post(`/comments/${commentId}/like`).then((r) => r.data),
  },

  reviews: {
    get: (showId: number, season: number, episode: number) =>
      http
        .get<ReviewData>("/reviews", {
          params: { showId, season, episode },
        })
        .then((r) => r.data),

    save: (data: ReviewPayload) =>
      http.put("/reviews", data).then((r) => r.data),
  },

  favorites: {
    check: (showId: number) =>
      http
        .get<{ isFavorite: boolean }>("/favorites", {
          params: { showId },
        })
        .then((r) => r.data.isFavorite),

    add: (data: { showId: number; showName: string; posterPath: string | null }) =>
      http.post("/favorites", data).then((r) => r.data),

    remove: (showId: number) =>
      http.delete("/favorites", { params: { showId } }).then((r) => r.data),
  },

  lists: {
    getAll: (showId?: number) =>
      http
        .get<ListData[]>("/lists", { params: showId ? { showId } : {} })
        .then((r) => r.data),

    create: (data: CreateListPayload) =>
      http.post<ListData>("/lists", data).then((r) => r.data),

    addItem: (listId: string, data: ListItemPayload) =>
      http.post(`/lists/${listId}/items`, data).then((r) => r.data),

    removeItem: (listId: string, showId: number) =>
      http
        .delete(`/lists/${listId}/items`, { params: { showId } })
        .then((r) => r.data),

    deleteItem: (itemId: string) =>
      http.delete(`/lists/items/${itemId}`).then((r) => r.data),
  },

  profile: {
    update: (data: { username: string; avatarUrl: string }) =>
      http.put("/profile", data).then((r) => r.data),
  },

  shows: {
    trackerCount: (showId: number) =>
      http
        .get<{ trackerCount: number }>("/shows/stats", { params: { showId } })
        .then((r) => r.data.trackerCount),
  },
};
