import { apiFetch } from "./api";
import type { AuthUser } from "./auth.store";

export async function fetchMyProfile(token: string) {
  return apiFetch<{ user: AuthUser }>("/api/auth/me", { token });
}

export async function updateMyProfile(
  token: string,
  input: { name?: string; avatarUrl?: string; bio?: string },
) {
  return apiFetch<{ user: AuthUser }>("/api/auth/me", { token, method: "PUT", body: input });
}
