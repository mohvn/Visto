import { searchTV } from "@/lib/tmdb";
import { ShowCard } from "@/components/show-card";
import { Header } from "@/components/header";
import { SearchX } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";
  const results = query ? await searchTV(query) : null;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {query && (
          <h1 className="text-lg font-semibold mb-6">
            Resultados para{" "}
            <span className="text-primary">&quot;{query}&quot;</span>
          </h1>
        )}

        {results && results.results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.results.map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        ) : query ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <SearchX className="h-12 w-12 mb-4" />
            <p className="text-lg">Nenhum resultado encontrado</p>
            <p className="text-sm">Tente buscar com outros termos</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
