"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/auth.store";
import { updateMyProfile } from "@/lib/profile";

function initials(name?: string) {
  if (!name) return "U";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export default function ProfilePage() {
  const { accessToken, user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
    setAvatarUrl(user?.avatarUrl ?? "");
    setBio(user?.bio ?? "");
  }, [user?.name, user?.avatarUrl, user?.bio]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Not authenticated");
      return updateMyProfile(accessToken, { name: name.trim(), avatarUrl: avatarUrl.trim(), bio: bio.trim() });
    },
    onSuccess: (res) => {
      if (accessToken) setUser(res.user);
    },
  });

  if (!accessToken) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <Card title="Sign in required">
          <Link href="/login" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            Sign in
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Card title="Profile settings">
        <div className="mb-6 flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile avatar" className="h-16 w-16 rounded-full border border-zinc-300 object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-300 bg-white text-lg font-bold text-zinc-700">
              {initials(name || user?.name)}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">{user?.email}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300">Upload an avatar URL and personalize your profile.</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Avatar URL</div>
            <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Bio</div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={240}
              rows={4}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-400/60 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Tell us your travel style..."
            />
            <div className="text-right text-xs text-zinc-500">{bio.length}/240</div>
          </div>
        </div>

        {mutation.isError ? <div className="mt-4 text-sm text-red-600 dark:text-red-300">{(mutation.error as any)?.message ?? "Failed to save profile"}</div> : null}
        {mutation.isSuccess ? <div className="mt-4 text-sm text-emerald-600 dark:text-emerald-300">Profile updated.</div> : null}

        <div className="mt-6 flex justify-end">
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
