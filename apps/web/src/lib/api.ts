export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

import { useAuthStore } from "./auth.store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function apiFetch<T>(path: string, opts?: { method?: string; body?: any; token?: string; headers?: Record<string, string> }) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts?.method ?? (opts?.body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
      ...(opts?.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...(opts?.headers ?? {}),
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401 && opts?.token && typeof window !== "undefined") {
      useAuthStore.getState().logout();
      window.sessionStorage.setItem("trao-session-expired", "1");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    const err = (data ?? { error: { code: "HTTP_ERROR", message: "Request failed", details: text } }) as ApiError;
    throw Object.assign(new Error(err.error.message), { status: res.status, ...err });
  }

  return data as T;
}

