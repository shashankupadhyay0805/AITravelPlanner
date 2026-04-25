"use client";

import { cn } from "@/lib/cn";

export function Card(props: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200 bg-white/85 p-5 text-zinc-900 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur",
        "dark:border-white/10 dark:bg-white/5 dark:text-white dark:shadow-[0_20px_80px_-40px_rgba(0,0,0,0.7)]",
        props.className,
      )}
    >
      {props.title ? <div className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white/90">{props.title}</div> : null}
      {props.children}
    </div>
  );
}

