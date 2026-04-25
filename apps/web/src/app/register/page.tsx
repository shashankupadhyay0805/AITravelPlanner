"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ user: any; accessToken: string }>("/api/auth/register", {
        body: { name, email, password },
      });
      setAuth(res.user, res.accessToken);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.error?.message ?? err?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-md" title="Create account">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <div className="text-sm font-medium text-zinc-700 dark:text-white/80">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
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
            {loading ? "Creating..." : "Create account"}
          </Button>
          <div className="text-sm text-zinc-600 dark:text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-zinc-900 underline underline-offset-4 dark:text-white">
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

