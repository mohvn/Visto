"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { posterUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, List, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDragScroll } from "@/hooks/use-drag-scroll";

interface ListItem {
  show_id: number;
  show_name: string;
  poster_path: string | null;
}

interface UserList {
  id: string;
  name: string;
  description: string | null;
  list_items: ListItem[];
}

interface ListsSectionProps {
  lists: UserList[];
}

export function ListsSection({ lists }: ListsSectionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const drag = useDragScroll<HTMLDivElement>();

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);

    await api.lists.create({ name: name.trim() });

    setName("");
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <List className="h-5 w-5 text-primary" />
          Listas
        </h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer">
              <Plus className="h-4 w-4" />
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar nova lista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="Nome da lista"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="w-full"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar lista
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lists.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground rounded-xl border border-dashed border-border">
          Crie sua primeira lista
        </div>
      ) : (
        <div
          ref={drag.ref}
          {...drag.bind}
          className="flex gap-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing select-none"
        >
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/list/${list.id}`}
              className="group shrink-0 w-48 select-none"
            >
              <div className="relative h-28 w-48 overflow-hidden rounded-lg bg-card border border-border transition-all group-hover:border-primary/50">
                {list.list_items.length > 0 ? (
                  <div className="grid grid-cols-4 h-full">
                    {list.list_items.slice(0, 4).map((item, i) => {
                      const poster = posterUrl(item.poster_path, "w92");
                      return (
                        <div key={i} className="relative h-full">
                          {poster ? (
                            <Image
                              src={poster}
                              alt={item.show_name}
                              fill
                              sizes="48px"
                              className="object-cover opacity-60"
                            />
                          ) : (
                            <div className="h-full bg-muted" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full bg-gradient-to-br from-muted to-card" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-semibold text-sm text-white truncate">
                    {list.name}
                  </p>
                  <p className="text-xs text-white/60">
                    {list.list_items.length} séries
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
