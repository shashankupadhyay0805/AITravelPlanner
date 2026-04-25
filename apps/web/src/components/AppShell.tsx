"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useAuthStore } from "@/lib/auth.store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, logout } = useAuthStore();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-dvh">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#f3f6ff] dark:bg-[#05060a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.16),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.12),transparent_45%),radial-gradient(circle_at_30%_90%,rgba(236,72,153,0.08),transparent_45%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.18),transparent_45%),radial-gradient(circle_at_30%_90%,rgba(236,72,153,0.12),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35),transparent_45%,rgba(255,255,255,0.18))] dark:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_40%,rgba(255,255,255,0.03))]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/65 backdrop-blur dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-400 to-indigo-600 shadow-indigo-500/25 shadow-sm">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-white">
                <path
                  d="M12 2.75c-3.46 0-6.25 2.79-6.25 6.24 0 4.5 5.04 9.74 5.25 9.96a1.4 1.4 0 0 0 2 0c.21-.22 5.25-5.46 5.25-9.96 0-3.45-2.79-6.24-6.25-6.24Zm0 8.55a2.31 2.31 0 1 1 0-4.62 2.31 2.31 0 0 1 0 4.62Z"
                  fill="currentColor"
                />
                <path
                  d="M6.2 18.2c1.7.85 3.67 1.3 5.8 1.3 2.15 0 4.12-.45 5.82-1.31"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">Trao</div>
              <div className="text-xs text-zinc-600 dark:text-white/60">AI Travel Planner</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white",
                pathname?.startsWith("/dashboard") && "bg-zinc-100 text-zinc-900 dark:bg-white/5 dark:text-white",
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/trips/new"
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white",
                pathname?.startsWith("/trips/new") && "bg-zinc-100 text-zinc-900 dark:bg-white/5 dark:text-white",
              )}
            >
              New trip
            </Link>
            {accessToken ? (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  href="/profile"
                  className="hidden items-center gap-2 rounded-xl px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-white/70 dark:hover:bg-white/5 sm:flex"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="h-7 w-7 rounded-full border border-zinc-300 object-cover dark:border-white/20" />
                  ) : (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 bg-white text-xs font-semibold text-zinc-700 dark:border-white/20 dark:bg-white/10 dark:text-white/80">
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </span>
                  )}
                  {user?.name ? <span className="text-zinc-800 dark:text-white/80">{user.name}</span> : null}
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                >
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                >
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </Button>
                <Link href="/register" className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white/10 dark:hover:bg-white/15">
                  Create account
                </Link>
                <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-white/70 dark:hover:bg-white/5 dark:hover:text-white">
                  Sign in
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main
        className={cn(
          "w-full",
          pathname === "/" ? "max-w-none px-0 py-0" : "mx-auto max-w-6xl px-5 py-8",
        )}
      >
        {children}
      </main>
    </div>
  );
}

