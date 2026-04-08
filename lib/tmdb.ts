import axios from "axios";

const TMDB_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YmNkMjEyMDkxYzlmMTQ1MzBmNmE0NzA5ZGQ4YTI2NCIsIm5iZiI6MTc3MTk3NTU2MC4zODgsInN1YiI6IjY5OWUzMzg4ZDY4NjU2MzhlNjE5YWZhOCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.y0yt9cqXW0y4hY2usCrWUEWapJDfSRr3Mh3k_fdCbxw";

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    accept: "application/json",
  },
});

export const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "w1280") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export function stillUrl(path: string | null, size = "w300") {
  if (!path) return null;
  return `${IMAGE_BASE}/${size}${path}`;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  origin_country: string[];
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  vote_average: number;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  episode_number: number;
  season_number: number;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
}

export interface TVShowDetail {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  tagline: string;
  genres: { id: number; name: string }[];
  seasons: Season[];
  networks: { id: number; name: string; logo_path: string | null }[];
  created_by: { id: number; name: string }[];
  in_production: boolean;
  episode_run_time: number[];
}

export interface SeasonDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date: string | null;
  episodes: Episode[];
}

export interface SearchResult {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export async function searchTV(query: string, page = 1): Promise<SearchResult> {
  const { data } = await api.get("/search/tv", {
    params: { query, page, language: "pt-BR" },
  });
  return data;
}

export async function getTrending(): Promise<SearchResult> {
  const { data } = await api.get("/trending/tv/week", {
    params: { language: "pt-BR" },
  });
  return data;
}

export async function getPopular(page = 1): Promise<SearchResult> {
  const { data } = await api.get("/tv/popular", {
    params: { page, language: "pt-BR" },
  });
  return data;
}

export async function getTVShow(id: number): Promise<TVShowDetail> {
  const { data } = await api.get(`/tv/${id}`, {
    params: { language: "pt-BR" },
  });
  return data;
}

export async function getSeason(
  tvId: number,
  seasonNumber: number
): Promise<SeasonDetail> {
  const { data } = await api.get(`/tv/${tvId}/season/${seasonNumber}`, {
    params: { language: "pt-BR" },
  });
  return data;
}
