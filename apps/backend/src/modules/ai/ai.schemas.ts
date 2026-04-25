import { z } from "zod";

export const aiItinerarySchema = z.object({
  itinerary: z
    .array(
      z.object({
        day: z.number().int().min(1),
        title: z.string().optional(),
        activities: z.array(
          z.object({
            title: z.string().min(1),
            time: z.string().optional(),
            type: z.enum(["outdoor", "indoor", "mixed"]).optional(),
            notes: z.string().optional(),
          }),
        ),
      }),
    )
    .min(1),
  budget: z.object({
    currency: z.string().min(1).default("USD"),
    flights: z.number().nonnegative(),
    accommodation: z.number().nonnegative(),
    food: z.number().nonnegative(),
    activities: z.number().nonnegative(),
    localTransport: z.number().nonnegative(),
    misc: z.number().nonnegative(),
    total: z.number().nonnegative(),
  }),
  hotels: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.enum(["budget", "mid", "luxury"]),
        area: z.string().optional(),
      }),
    )
    .default([]),
});

