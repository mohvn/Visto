"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { buttonVariants } from "@/components/ui/button";
import { LogIn, LogOut, User, ChevronDown } from "lucide-react";

export function UserMenu() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className={buttonVariants({ size: "sm", variant: "outline", className: "gap-1.5" })}
      >
        <LogIn className="h-4 w-4" />
        Entrar
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.username || user.email?.split("@")[0] || "Usuário";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/80"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
          {displayName[0].toUpperCase()}
        </div>
        <span className="hidden sm:inline max-w-24 truncate">{displayName}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-popover p-1 shadow-lg">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Meu Perfil
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
