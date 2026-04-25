"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("trao-session-expired") === "1") {
      setSessionExpiredNotice("Session expired. Please sign in again.");
      window.sessionStorage.removeItem("trao-session-expired");
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ user: any; accessToken: string }>("/api/auth/login", {
        body: { email, password },
      });
      setAuth(res.user, res.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.error?.message ?? err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md" title="Sign in">
        <form className="space-y-4" onSubmit={onSubmit}>
          {sessionExpiredNotice ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200">
              {sessionExpiredNotice}
            </div>
          ) : null}
          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-700 dark:text-white/80">Email</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-700 dark:text-white/80">Password</div>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          {error ? <div className="text-sm text-red-600 dark:text-red-300">{error}</div> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-sm text-zinc-600 dark:text-white/60">
            No account?{" "}
            <Link href="/register" className="font-semibold text-zinc-900 underline underline-offset-4 dark:text-white">
              Create one
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

