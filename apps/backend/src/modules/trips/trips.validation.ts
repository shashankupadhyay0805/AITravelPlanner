import { z } from "zod";

export const budgetTypeSchema = z.enum(["Low", "Medium", "High"]);

export const createTripSchema = z.object({
  destination: z.string().min(2).max(120),
  country: z.string().min(2).max(80).optional(),
  region: z.string().min(2).max(80).optional(),
  startDate: z.string().datetime().optional(),
  days: z.coerce.number().int().min(1).max(30),
  budgetType: budgetTypeSchema,
  interests: z.array(z.string().min(1).max(50)).max(20).default([]),
});

export const updateTripSchema = createTripSchema.partial();

export const patchItinerarySchema = z.object({
  itinerary: z.array(
    z.object({
      day: z.number().int().min(1).max(30),
      title: z.string().max(120).optional(),
      activities: z.array(
        z.object({
          title: z.string().min(1).max(160),
          time: z.string().max(40).optional(),
          type: z.string().max(20).optional(),
          notes: z.string().max(280).optional(),
        }),
      ),
    }),
  ),
});

export const regenerateDaySchema = z.object({
  day: z.number().int().min(1).max(30),
  notes: z.string().max(400).optional(),
});

