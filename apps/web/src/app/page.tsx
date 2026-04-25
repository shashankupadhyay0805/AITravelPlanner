import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden px-6 py-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('/home-bg.png')] bg-cover bg-center bg-no-repeat" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black/55" />
      <div className="grid w-full gap-6 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white/85">
            Production-grade • Multi-user • Weather-aware
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Plan trips in minutes with AI.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
            Trao generates day-by-day itineraries, structured budgets, and hotel suggestions. Add a start date and it
            adapts recommendations using real forecasts (Open‑Meteo) so rainy days lean indoor and sunny days go outdoor.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/trips/new"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-indigo-500/20 shadow-sm hover:from-indigo-400 hover:to-indigo-600"
            >
              Create a trip
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/55"
            >
              View dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-black/35 p-6 backdrop-blur">
          <div className="text-sm font-semibold text-white/90">What you get</div>
          <div className="mt-4 grid gap-3">
            {[
              ["Day-wise itinerary", "Editable activities with per-day regeneration."],
              ["Budget estimate", "Flights, stay, food, activities, transit, misc."],
              ["Hotel suggestions", "Budget/mid/luxury options based on destination."],
              ["Weather-aware planning", "Forecast injected into the AI prompt."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/15 bg-black/30 p-4">
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="mt-1 text-sm text-white/70">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
