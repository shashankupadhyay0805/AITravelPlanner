"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuthStore } from "@/lib/auth.store";
import { fetchHolidays } from "@/lib/holidays";
import { fetchMyProfile } from "@/lib/profile";
import { fetchTrips } from "@/lib/trips";

const COUNTRY_OPTIONS = [
  { code: "IN", label: "India" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "AE", label: "UAE" },
  { code: "JP", label: "Japan" },
];

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, accessToken, logout, setUser } = useAuthStore();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [countryCode, setCountryCode] = useState("IN");

  const tripsQuery = useQuery({
    queryKey: ["trips"],
    queryFn: async () => fetchTrips(accessToken!),
    enabled: Boolean(accessToken),
  });

  const meQuery = useQuery({
    queryKey: ["me", accessToken],
    queryFn: async () => fetchMyProfile(accessToken!),
    enabled: Boolean(accessToken),
  });

  useEffect(() => {
    if (meQuery.data?.user) setUser(meQuery.data.user);
  }, [meQuery.data?.user, setUser]);

  const holidaysQuery = useQuery({
    queryKey: ["holidays", countryCode, year],
    queryFn: async () => {
      const res = await fetchHolidays(year, countryCode);
      return res.holidays;
    },
  });

  if (!accessToken) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-lg" title="Sign in required">
          <div className="text-sm text-zinc-600">You need to sign in to view your trips.</div>
          <div className="mt-4 flex gap-3">
            <Link className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white" href="/login">
              Sign in
            </Link>
            <Link className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold" href="/register">
              Create account
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const trips = tripsQuery.data?.trips ?? [];
  const monthGrid = buildMonthGrid(year, month);
  const selectedMonthHolidays =
    holidaysQuery.data?.filter((h) => {
      const d = new Date(h.date);
      return d.getMonth() === month;
    }) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Dashboard</div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Welcome, {user?.name ?? "traveler"}</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Your trips are private to your account.</div>
        </div>
        <div className="flex gap-2">
          <Link href="/trips/new" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
            New trip
          </Link>
          <Link href="/profile" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50">
            Profile
          </Link>
          <Button
            className="bg-white text-zinc-900 border border-zinc-200 hover:bg-zinc-50"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {tripsQuery.isLoading ? (
          <Card title="Loading trips...">
            <div className="text-sm text-zinc-600">Fetching your trips.</div>
          </Card>
        ) : tripsQuery.isError ? (
          <Card title="Could not load trips">
            <div className="text-sm text-red-600">Please try again.</div>
          </Card>
        ) : trips.length === 0 ? (
          <Card title="No trips yet">
            <div className="text-sm text-zinc-600">Create your first trip and generate an itinerary.</div>
            <div className="mt-4">
              <Link href="/trips/new" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
                Create trip
              </Link>
            </div>
          </Card>
        ) : (
          trips.map((t) => (
            <Link key={t._id} href={`/trips/${t._id}`} className="block">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm hover:bg-zinc-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">{t.destination}</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {t.days} days • {t.budgetType} budget • {t.interests?.length ?? 0} interests{t.country ? ` • ${t.country}` : ""}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">Updated {new Date(t.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Calendar">
          <div className="mb-3 flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-white/20 dark:bg-white/10 dark:text-white"
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx} value={idx} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
                  {new Date(year, idx, 1).toLocaleString(undefined, { month: "long" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1970}
              max={2100}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-white/20 dark:bg-white/10 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1 font-semibold text-zinc-600 dark:text-zinc-300">
                {d}
              </div>
            ))}
            {monthGrid.map((day, i) => (
              <div
                key={i}
                className={`rounded-md py-2 ${day ? "bg-white text-zinc-900 dark:bg-white/10 dark:text-white" : "bg-transparent"}`}
              >
                {day ?? ""}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Holidays">
          <div className="mb-3 flex items-center gap-2">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-white/20 dark:bg-white/10 dark:text-white"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
                  {c.label}
                </option>
              ))}
            </select>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              {new Date(year, month, 1).toLocaleString(undefined, { month: "long", year: "numeric" })}
            </span>
          </div>
          {holidaysQuery.isLoading ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">Loading holidays...</div>
          ) : holidaysQuery.isError ? (
            <div className="text-sm text-red-600 dark:text-red-300">Could not fetch holidays.</div>
          ) : selectedMonthHolidays.length === 0 ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">No public holidays found for this month.</div>
          ) : (
            <div className="space-y-2">
              {selectedMonthHolidays.map((h, idx) => (
                <div key={`${h.date}-${h.name}-${idx}`} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">{h.localName}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-300">
                    {new Date(h.date).toLocaleDateString()} • {h.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

