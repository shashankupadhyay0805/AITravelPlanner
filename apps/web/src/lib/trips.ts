import { apiFetch } from "./api";
import type { AuthUser } from "./auth.store";

export type Trip = {
  _id: string;
  destination: string;
  country?: string;
  region?: string;
  startDate?: string;
  days: number;
  budgetType: "Low" | "Medium" | "High";
  interests: string[];
  itinerary: Array<{ day: number; title?: string; activities: Array<{ title: string; time?: string; type?: string; notes?: string }> }>;
  budget?: any;
  hotels: Array<{ name: string; category: string; area?: string }>;
  weather?: { summary: string; fetchedAt: string; source: string };
  updatedAt: string;
};

export async function fetchTrips(token: string) {
  return apiFetch<{ trips: Trip[] }>("/api/trips", { token });
}

export async function createTrip(
  token: string,
  input: {
    destination: string;
    country?: string;
    region?: string;
    startDate?: string;
    days: number;
    budgetType: "Low" | "Medium" | "High";
    interests: string[];
  },
) {
  return apiFetch<{ trip: Trip }>("/api/trips", { token, body: input });
}

export async function getTrip(token: string, id: string) {
  return apiFetch<{ trip: Trip }>(`/api/trips/${id}`, { token });
}

export async function generateTrip(token: string, id: string) {
  return apiFetch<{ trip: Trip }>(`/api/trips/${id}/generate`, { token, method: "POST" });
}

export async function regenerateDay(token: string, id: string, day: number, notes?: string) {
  return apiFetch<{ trip: Trip }>(`/api/trips/${id}/regenerate-day`, { token, body: { day, notes } });
}

export async function saveItinerary(token: string, id: string, itinerary: Trip["itinerary"]) {
  return apiFetch<{ trip: Trip }>(`/api/trips/${id}/itinerary`, { token, method: "PUT", body: { itinerary } });
}

