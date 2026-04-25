"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-indigo-500/20 hover:from-indigo-400 hover:to-indigo-600",
        variant === "secondary" &&
          "border border-zinc-300 bg-white text-zinc-900 backdrop-blur hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
        variant === "ghost" && "bg-transparent text-zinc-700 hover:bg-zinc-100 dark:text-white/80 dark:hover:bg-white/5",
        className,
      )}
    />
  );
}

