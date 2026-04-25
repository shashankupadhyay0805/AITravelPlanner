"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/auth.store";
import { generateTrip, getTrip, regenerateDay, saveItinerary, type Trip } from "@/lib/trips";

const SUPPORTED_CURRENCIES = ["USD", "INR", "EUR", "GBP", "JPY", "AED"] as const;

const TO_USD_RATE: Record<(typeof SUPPORTED_CURRENCIES)[number], number> = {
  USD: 1,
  INR: 0.012,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0066,
  AED: 0.272,
};

function convertCurrency(
  amount: number,
  from: (typeof SUPPORTED_CURRENCIES)[number],
  to: (typeof SUPPORTED_CURRENCIES)[number],
) {
  if (from === to) return amount;
  return amount * (TO_USD_RATE[from] / TO_USD_RATE[to]);
}

function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function fullDestination(trip?: Trip) {
  if (!trip) return "";
  return [trip.destination, trip.region, trip.country].filter(Boolean).join(", ");
}

function DayEditor(props: {
  day: Trip["itinerary"][number];
  destination: string;
  onChange: (next: Trip["itinerary"][number]) => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold">Day {props.day.day}</div>
        <div className="text-xs text-zinc-500">{props.day.title ?? ""}</div>
      </div>
      <div className="mt-3 space-y-2">
        {props.day.activities.map((a, idx) => (
          <div key={idx} className="flex gap-2">
            <Input
              value={a.title}
              onChange={(e) => {
                const next = structuredClone(props.day);
                next.activities[idx] = { ...next.activities[idx], title: e.target.value };
                props.onChange(next);
              }}
              className="flex-1 border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400/60 focus:bg-white dark:border-zinc-200 dark:bg-white dark:text-zinc-900 dark:placeholder:text-zinc-400 dark:focus:bg-white"
            />
            <a
              href={mapsSearchUrl(`${a.title} ${props.destination}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              Map
            </a>
            <Button
              type="button"
              className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
              onClick={() => {
                const next = structuredClone(props.day);
                next.activities.splice(idx, 1);
                props.onChange(next);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
          onClick={() => {
            const next = structuredClone(props.day);
            next.activities.push({ title: "New activity" });
            props.onChange(next);
          }}
        >
          Add activity
        </Button>
      </div>
    </div>
  );
}

export default function TripDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [regenDay, setRegenDay] = useState(1);
  const [regenNotes, setRegenNotes] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<(typeof SUPPORTED_CURRENCIES)[number]>("USD");

  const tripQuery = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => getTrip(accessToken!, id),
    enabled: Boolean(accessToken && id),
  });

  const trip = tripQuery.data?.trip;
  const [draft, setDraft] = useState<Trip["itinerary"] | null>(null);

  const itinerary = useMemo(() => draft ?? trip?.itinerary ?? [], [draft, trip?.itinerary]);
  const destinationLabel = fullDestination(trip);
  const baseCurrency = (trip?.budget?.currency?.toUpperCase() ?? "USD") as (typeof SUPPORTED_CURRENCIES)[number];

  useEffect(() => {
    if (SUPPORTED_CURRENCIES.includes(baseCurrency)) {
      setSelectedCurrency(baseCurrency);
    } else {
      setSelectedCurrency("USD");
    }
  }, [baseCurrency]);

  const formatBudget = (amount: number) => {
    const from = SUPPORTED_CURRENCIES.includes(baseCurrency) ? baseCurrency : "USD";
    const converted = convertCurrency(amount, from, selectedCurrency);
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: selectedCurrency,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  const generateMutation = useMutation({
    mutationFn: async () => generateTrip(accessToken!, id),
    onSuccess: async () => {
      setDraft(null);
      await qc.invalidateQueries({ queryKey: ["trip", id] });
      await qc.invalidateQueries({ queryKey: ["trips"] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => saveItinerary(accessToken!, id, itinerary),
    onSuccess: async () => {
      setDraft(null);
      await qc.invalidateQueries({ queryKey: ["trip", id] });
    },
  });

  const regenMutation = useMutation({
    mutationFn: async () => regenerateDay(accessToken!, id, regenDay, regenNotes || undefined),
    onSuccess: async () => {
      setDraft(null);
      await qc.invalidateQueries({ queryKey: ["trip", id] });
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
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Trip</div>
          <div className="mt-1 text-2xl font-bold tracking-tight">{trip?.destination ?? "Loading..."}</div>
          <div className="mt-1 text-sm text-zinc-600">
            {trip ? `${trip.days} days • ${trip.budgetType} budget${trip.country ? ` • ${trip.country}` : ""}` : ""}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Back
          </Link>
          <Button disabled={generateMutation.isPending} onClick={() => generateMutation.mutate()}>
            {generateMutation.isPending ? "Generating..." : "Generate with AI"}
          </Button>
        </div>
      </div>

      {tripQuery.isError ? (
        <div className="mt-6">
          <Card title="Could not load trip">
            <div className="text-sm text-red-600">Please try again.</div>
          </Card>
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Itinerary (editable)">
            <div className="space-y-3">
              {itinerary.length === 0 ? (
                <div className="text-sm text-zinc-600">No itinerary yet. Click “Generate with AI”.</div>
              ) : (
                itinerary.map((d, idx) => (
                  <DayEditor
                    key={d.day ?? idx}
                    day={d}
                    destination={destinationLabel || trip?.destination || ""}
                    onChange={(next) => {
                      setDraft((prev) => {
                        const base = prev ?? structuredClone(trip?.itinerary ?? []);
                        const copy = structuredClone(base);
                        const i = copy.findIndex((x) => x.day === next.day);
                        if (i >= 0) copy[i] = next;
                        else copy.push(next);
                        copy.sort((a, b) => a.day - b.day);
                        return copy;
                      });
                    }}
                  />
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
                onClick={() => setDraft(null)}
                disabled={!draft || saveMutation.isPending}
              >
                Reset
              </Button>
              <Button onClick={() => saveMutation.mutate()} disabled={!draft || saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Regenerate a day (AI)">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Day number</div>
                <Input value={String(regenDay)} onChange={(e) => setRegenDay(Number(e.target.value))} type="number" min={1} max={30} />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Notes (optional)</div>
                <Input value={regenNotes} onChange={(e) => setRegenNotes(e.target.value)} placeholder="e.g., more kid-friendly, avoid museums" />
              </div>
              <Button disabled={regenMutation.isPending} onClick={() => regenMutation.mutate()}>
                {regenMutation.isPending ? "Regenerating..." : "Regenerate day"}
              </Button>
            </div>
          </Card>

          <Card title="Weather-aware planning (Open‑Meteo)">
            {!trip?.startDate ? (
              <div className="text-sm text-zinc-600">
                Add a <span className="font-semibold">start date</span> to enable forecast-aware suggestions.
              </div>
            ) : trip?.weather?.summary ? (
              <div className="text-sm whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">{trip.weather.summary}</div>
            ) : (
              <div className="text-sm text-zinc-600">
                Forecast will appear after you click <span className="font-semibold">Generate with AI</span> or
                <span className="font-semibold"> Regenerate day</span>.
              </div>
            )}
          </Card>

          <Card title="Budget estimate">
            {trip?.budget ? (
              <div className="space-y-2 text-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-zinc-400">Display currency</span>
                  <select
                    className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 outline-none dark:border-white/20 dark:bg-white/10 dark:text-white"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value as (typeof SUPPORTED_CURRENCIES)[number])}
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c} className="bg-zinc-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between"><span>Flights</span><span>{formatBudget(trip.budget.flights)}</span></div>
                <div className="flex justify-between"><span>Accommodation</span><span>{formatBudget(trip.budget.accommodation)}</span></div>
                <div className="flex justify-between"><span>Food</span><span>{formatBudget(trip.budget.food)}</span></div>
                <div className="flex justify-between"><span>Activities</span><span>{formatBudget(trip.budget.activities)}</span></div>
                <div className="flex justify-between"><span>Local transport</span><span>{formatBudget(trip.budget.localTransport)}</span></div>
                <div className="flex justify-between"><span>Misc</span><span>{formatBudget(trip.budget.misc)}</span></div>
                <div className="mt-2 flex justify-between border-t border-zinc-200 pt-2 font-semibold"><span>Total</span><span>{formatBudget(trip.budget.total)}</span></div>
              </div>
            ) : (
              <div className="text-sm text-zinc-600">Generate the trip to get a budget breakdown.</div>
            )}
          </Card>

          <Card title="Hotel suggestions">
            {trip?.hotels?.length ? (
              <div className="space-y-2">
                {trip.hotels.map((h, idx) => (
                  <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-zinc-900">{h.name}</div>
                      <a
                        href={mapsSearchUrl(`${h.name} ${h.area ?? ""} ${destinationLabel || trip.destination}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                      >
                        Open map
                      </a>
                    </div>
                    <div className="text-xs text-zinc-600">{h.category}{h.area ? ` • ${h.area}` : ""}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-zinc-600">Generate the trip to get hotel options.</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

