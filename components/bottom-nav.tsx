"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, User, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  {
    href: "/",
    label: "Explorar",
    icon: Compass,
    match: (p: string) => p === "/" || p.startsWith("/search") || p.startsWith("/show"),
  },
  {
    href: "/watchlist",
    label: "A Assistir",
    icon: CalendarCheck,
    match: (p: string) => p.startsWith("/watchlist"),
  },
  {
    href: "/profile",
    label: "Perfil",
    icon: User,
    match: (p: string) => p.startsWith("/profile"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 sm:hidden border-t border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-stretch h-16 safe-area-bottom">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  active && "scale-110"
                )}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
