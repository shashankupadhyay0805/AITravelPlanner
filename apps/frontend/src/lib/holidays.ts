import { apiFetch } from "./api";

export type Holiday = { date: string; localName: string; name: string };

export async function fetchHolidays(year: number, country: string) {
  return apiFetch<{ holidays: Holiday[] }>(`/api/holidays?year=${year}&country=${country}`);
}
