import { Types } from "mongoose";
import { HttpError } from "../../shared/http/httpError.js";
import { TripModel } from "./trip.model.js";
import { generateTripAI } from "../ai/ai.service.js";
import { getWeatherSummary } from "../weather/weather.service.js";

function buildDestinationQuery(input: { destination: string; region?: string; country?: string }) {
  return [input.destination, input.region, input.country].filter(Boolean).join(", ");
}

export async function listTrips(userId: string) {
  return TripModel.find({ userId }).sort({ updatedAt: -1 }).lean();
}

export async function getTrip(userId: string, tripId: string) {
  const trip = await TripModel.findOne({ _id: tripId, userId }).lean();
  if (!trip) throw new HttpError({ status: 404, code: "TRIP_NOT_FOUND", message: "Trip not found" });
  return trip;
}

export async function createTrip(userId: string, input: any) {
  const trip = await TripModel.create({
    userId: new Types.ObjectId(userId),
    destination: input.destination,
    country: input.country,
    region: input.region,
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    days: input.days,
    budgetType: input.budgetType,
    interests: input.interests ?? [],
    itinerary: [],
    hotels: [],
  });
  return trip.toObject();
}

export async function updateTrip(userId: string, tripId: string, input: any) {
  const updated = await TripModel.findOneAndUpdate(
    { _id: tripId, userId },
    {
      ...(input.destination !== undefined ? { destination: input.destination } : {}),
      ...(input.country !== undefined ? { country: input.country } : {}),
      ...(input.region !== undefined ? { region: input.region } : {}),
      ...(input.startDate !== undefined ? { startDate: input.startDate ? new Date(input.startDate) : null } : {}),
      ...(input.days !== undefined ? { days: input.days } : {}),
      ...(input.budgetType !== undefined ? { budgetType: input.budgetType } : {}),
      ...(input.interests !== undefined ? { interests: input.interests } : {}),
    },
    { new: true },
  ).lean();
  if (!updated) throw new HttpError({ status: 404, code: "TRIP_NOT_FOUND", message: "Trip not found" });
  return updated;
}

export async function deleteTrip(userId: string, tripId: string) {
  const deleted = await TripModel.findOneAndDelete({ _id: tripId, userId }).lean();
  if (!deleted) throw new HttpError({ status: 404, code: "TRIP_NOT_FOUND", message: "Trip not found" });
  return deleted;
}

export async function generateTrip(userId: string, tripId: string) {
  const trip = await TripModel.findOne({ _id: tripId, userId });
  if (!trip) throw new HttpError({ status: 404, code: "TRIP_NOT_FOUND", message: "Trip not found" });

  const destinationQuery = buildDestinationQuery({
    destination: trip.destination,
    region: (trip as any).region,
    country: (trip as any).country,
  });

  const weatherSummary = await getWeatherSummary({
    destination: destinationQuery,
    startDate: trip.startDate?.toISOString(),
    days: trip.days,
  });

  const ai = await generateTripAI({
    destination: destinationQuery,
    startDate: trip.startDate?.toISOString(),
    days: trip.days,
    budgetType: trip.budgetType as any,
    interests: trip.interests,
    weatherSummary,
  });

  trip.weather = weatherSummary
    ? ({ summary: weatherSummary, fetchedAt: new Date(), source: "open-meteo" } as any)
    : undefined;
  trip.itinerary = ai.itinerary as any;
  trip.budget = ai.budget as any;
  trip.hotels = ai.hotels as any;
  trip.aiMeta = { provider: ai.provider, model: ai.model, generatedAt: new Date() } as any;
  await trip.save();

  return trip.toObject();
}

export async function regenerateDay(userId: string, tripId: string, day: number, notes?: string) {
  const trip = await TripModel.findOne({ _id: tripId, userId });
  if (!trip) throw new HttpError({ status: 404, code: "TRIP_NOT_FOUND", message: "Trip not found" });

  const destinationQuery = buildDestinationQuery({
    destination: trip.destination,
    region: (trip as any).region,
    country: (trip as any).country,
  });

  const weatherSummary = await getWeatherSummary({
    destination: destinationQuery,
    startDate: trip.startDate?.toISOString(),
    days: trip.days,
  });

  const ai = await generateTripAI({
    destination: destinationQuery,
    startDate: trip.startDate?.toISOString(),
    days: 1,
    budgetType: trip.budgetType as any,
    interests: [...trip.interests, ...(notes ? [`User notes: ${notes}`] : [])],
    weatherSummary,
  });

  trip.weather = weatherSummary
    ? ({ summary: weatherSummary, fetchedAt: new Date(), source: "open-meteo" } as any)
    : trip.weather;

  const newDay = ai.itinerary[0];
  if (!newDay) {
    throw new HttpError({ status: 502, code: "AI_BAD_RESPONSE", message: "AI did not return a day plan" });
  }
  newDay.day = day;

  const idx = (trip.itinerary as any[]).findIndex((d) => d.day === day);
  if (idx >= 0) (trip.itinerary as any[])[idx] = newDay;
  else (trip.itinerary as any[]).push(newDay);

  (trip.itinerary as any[]).sort((a, b) => a.day - b.day);
  await trip.save();
  return trip.toObject();
}

export async function saveItinerary(userId: string, tripId: string, itinerary: any) {
  const trip = await TripModel.findOne({ _id: tripId, userId });
  if (!trip) throw new HttpError({ status: 404, code: "TRIP_NOT_FOUND", message: "Trip not found" });
  trip.itinerary = itinerary;
  await trip.save();
  return trip.toObject();
}

