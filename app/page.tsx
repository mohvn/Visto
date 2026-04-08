import { getTrending, getPopular } from "@/lib/tmdb";
import { ShowCard } from "@/components/show-card";
import { Header } from "@/components/header";
import { TrendingUp, Flame } from "lucide-react";

export default async function HomePage() {
  const [trending, popular] = await Promise.all([
    getTrending(),
    getPopular(),
  ]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Em alta esta semana</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trending.results.slice(0, 12).map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Flame className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Populares</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popular.results.slice(0, 18).map((show) => (
              <ShowCard key={show.id} show={show} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
