import { HttpError } from "../../shared/http/httpError.js";

type Geo = { name: string; latitude: number; longitude: number; country?: string; admin1?: string };

async function geocodeCity(query: string): Promise<Geo> {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=" +
    encodeURIComponent(query);
  const resp = await fetch(url);
  if (!resp.ok) throw new HttpError({ status: 502, code: "WEATHER_UPSTREAM_ERROR", message: "Geocoding failed" });
  const data = (await resp.json()) as any;
  const first = data?.results?.[0];
  if (!first) throw new HttpError({ status: 400, code: "BAD_DESTINATION", message: "Unknown destination" });
  return {
    name: first.name,
    latitude: first.latitude,
    longitude: first.longitude,
    country: first.country,
    admin1: first.admin1,
  };
}

export async function getWeatherSummary(input: { destination: string; startDate?: string; days: number }) {
  if (!input.startDate) return undefined;

  const geo = await geocodeCity(input.destination);
  const start = new Date(input.startDate);
  if (Number.isNaN(start.getTime())) return undefined;

  const end = new Date(start);
  end.setDate(end.getDate() + Math.min(input.days, 14) - 1);

  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);

  const url =
    "https://api.open-meteo.com/v1/forecast?daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto" +
    `&latitude=${geo.latitude}&longitude=${geo.longitude}` +
    `&start_date=${startISO}&end_date=${endISO}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new HttpError({ status: 502, code: "WEATHER_UPSTREAM_ERROR", message: "Forecast failed" });
  const data = (await resp.json()) as any;

  const dates: string[] = data?.daily?.time ?? [];
  const tmax: number[] = data?.daily?.temperature_2m_max ?? [];
  const tmin: number[] = data?.daily?.temperature_2m_min ?? [];
  const rain: number[] = data?.daily?.precipitation_probability_max ?? [];

  const lines: string[] = [];
  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    lines.push(`${d}: ${tmin[i] ?? "?"}–${tmax[i] ?? "?"}°C, rain ${rain[i] ?? "?"}%`);
  }

  return `Forecast for ${geo.name}${geo.admin1 ? `, ${geo.admin1}` : ""}${geo.country ? `, ${geo.country}` : ""}:\n` + lines.join("\n");
}

