"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { api, type ListData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ListPlus, Plus, Check, Loader2 } from "lucide-react";

interface AddToListButtonProps {
  showId: number;
  showName: string;
  posterPath: string | null;
}

interface UserList extends ListData {
  has_show: boolean;
}

export function AddToListButton({
  showId,
  showName,
  posterPath,
}: AddToListButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadLists() {
    setLoading(true);
    const data = await api.lists.getAll(showId);
    setLists(
      data.map((l) => ({ ...l, has_show: l.has_show ?? false }))
    );
    setLoading(false);
  }

  async function toggleList(listId: string, hasShow: boolean) {
    if (hasShow) {
      await api.lists.removeItem(listId, showId);
    } else {
      await api.lists.addItem(listId, { showId, showName, posterPath });
    }

    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, has_show: !hasShow } : l
      )
    );
  }

  async function createList() {
    if (!newName.trim()) return;
    setCreating(true);

    const data = await api.lists.create({
      name: newName.trim(),
      showId,
      showName,
      posterPath,
    });

    if (data) {
      setLists((prev) => [
        { id: data.id, name: data.name, has_show: true },
        ...prev,
      ]);
    }

    setNewName("");
    setCreating(false);
    router.refresh();
  }

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) loadLists();
      }}
    >
      <DialogTrigger>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium bg-secondary text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all cursor-pointer">
          <ListPlus className="h-4 w-4" />
          Adicionar à lista
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar a uma lista</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => toggleList(list.id, list.has_show)}
                  className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-card"
                >
                  <span>{list.name}</span>
                  {list.has_show && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}

              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Nova lista..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createList()}
                  className="flex-1"
                />
                <Button
                  onClick={createList}
                  disabled={creating || !newName.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
