"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { X } from "lucide-react";

export function DeleteListItemButton({ itemId }: { itemId: string }) {
  const router = useRouter();

  async function handleDelete() {
    await api.lists.deleteItem(itemId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
    >
      <X className="h-3 w-3" />
    </button>
  );
}
