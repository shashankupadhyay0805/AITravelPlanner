"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400",
        "outline-none ring-0 focus:border-indigo-400/60 focus:bg-white",
        "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40 dark:focus:bg-white/10",
        className,
      )}
    />
  );
}

