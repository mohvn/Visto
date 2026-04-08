"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/user-menu";
import { Search, Tv } from "lucide-react";

export function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Tv className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Visto</span>
          </span>
        </Link>

        <form onSubmit={handleSubmit} className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar série..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-secondary border-none"
          />
        </form>

        <div className="hidden sm:block">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
