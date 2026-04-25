import { Router } from "express";
import Holidays from "date-holidays";
import { z } from "zod";

const querySchema = z.object({
  year: z.coerce.number().int().min(1970).max(2100),
  country: z.string().length(2).regex(/^[A-Z]{2}$/),
});

export const holidaysRouter = Router();

type HolidayItem = { date: string; localName: string; name: string };

function getFallbackHolidays(year: number, country: string): HolidayItem[] {
  const hd = new Holidays(country);
  const list = hd.getHolidays(year) ?? [];
  return list
    .map((h) => ({
      date: (h.date ?? "").slice(0, 10),
      localName: h.name,
      name: h.name,
    }))
    .filter((h) => h.date);
}

holidaysRouter.get("/", async (req, res, next) => {
  try {
    const q = querySchema.parse({
      year: req.query.year,
      country: String(req.query.country ?? "").toUpperCase(),
    });

    const upstream = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${q.year}/${q.country}`);
    if (upstream.ok) {
      const raw = await upstream.text();
      if (raw.trim()) {
        const parsed = JSON.parse(raw) as HolidayItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ holidays: parsed });
        }
      }
    }

    const fallback = getFallbackHolidays(q.year, q.country);
    if (fallback.length > 0) {
      return res.json({ holidays: fallback });
    }

    // If neither provider returns data, return an empty list instead of failing UI.
    return res.json({ holidays: [] });
  } catch (err) {
    return next(err);
  }
});
