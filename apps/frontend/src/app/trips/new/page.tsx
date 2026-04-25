"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/auth.store";
import { createTrip } from "@/lib/trips";

const ALL_INTERESTS = [
  "Food",
  "Museums",
  "Nature",
  "Shopping",
  "Nightlife",
  "History",
  "Adventure",
  "Relaxation",
  "Photography",
  "Local culture",
];

export default function NewTripPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(5);
  const [budgetType, setBudgetType] = useState<"Low" | "Medium" | "High">("Medium");
  const [interests, setInterests] = useState<string[]>([]);

  const canSubmit = useMemo(() => destination.trim().length >= 2 && days >= 1, [destination, days]);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) throw new Error("Not authenticated");
      return createTrip(accessToken, {
        destination,
        country: country.trim() || undefined,
        region: region.trim() || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        days,
        budgetType,
        interests,
      });
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["trips"] });
      router.push(`/trips/${res.trip._id}`);
    },
  });

  if (!accessToken) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Card title="Create trip">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <div className="text-sm font-medium">Destination</div>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Punjab" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Country (recommended for accuracy)</div>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g., India" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">State / Region (optional)</div>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g., Punjab" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Start date (enables weather-aware planning)</div>
            <Input value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Number of days</div>
            <Input value={String(days)} onChange={(e) => setDays(Number(e.target.value))} type="number" min={1} max={30} />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Budget</div>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value as any)}
            >
              <option value="Low" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Low</option>
              <option value="Medium" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Medium</option>
              <option value="High" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">High</option>
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <div className="text-sm font-medium">Interests</div>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map((i) => {
                const active = interests.includes(i);
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setInterests((prev) => (active ? prev.filter((x) => x !== i) : [...prev, i]))}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-semibold " +
                      (active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50")
                    }
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {mutation.isError ? <div className="mt-4 text-sm text-red-600">{(mutation.error as any)?.message ?? "Failed"}</div> : null}

        <div className="mt-6 flex justify-end gap-2">
          <Button disabled={!canSubmit || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

