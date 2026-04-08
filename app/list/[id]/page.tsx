import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { posterUrl } from "@/lib/tmdb";
import { DeleteListItemButton } from "@/components/delete-list-item-button";
import { ArrowLeft, List } from "lucide-react";

interface ListPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListPage({ params }: ListPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: list } = await supabase
    .from("lists")
    .select("*, list_items(id, show_id, show_name, poster_path, position)")
    .eq("id", id)
    .single();

  if (!list) notFound();

  const items = list.list_items.sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Meu Perfil
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <List className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{list.name}</h1>
            <p className="text-xs text-muted-foreground">
              {items.length} séries
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <List className="h-10 w-10 mb-3" />
            <p>Lista vazia</p>
            <p className="text-sm">Adicione séries pela página do show</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item: { id: string; show_id: number; show_name: string; poster_path: string | null }) => {
              const poster = posterUrl(item.poster_path, "w342");
              return (
                <div key={item.id} className="group relative">
                  <Link
                    href={`/show/${item.show_id}`}
                    className="block overflow-hidden rounded-lg border border-border transition-all hover:border-primary/50"
                  >
                    <div className="relative aspect-[2/3] bg-muted">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={item.show_name}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground p-2 text-center">
                          {item.show_name}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">
                        {item.show_name}
                      </p>
                    </div>
                  </Link>
                  <DeleteListItemButton itemId={item.id} />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
