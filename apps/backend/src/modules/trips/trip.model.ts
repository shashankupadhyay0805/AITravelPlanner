import mongoose, { Schema, type InferSchemaType, Types } from "mongoose";

const activitySchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    time: { type: String, required: false },
    type: { type: String, required: false }, // e.g., "outdoor" | "indoor"
    notes: { type: String, required: false },
  },
  { _id: false },
);

const daySchema = new Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, required: false },
    activities: { type: [activitySchema], required: true, default: [] },
  },
  { _id: false },
);

const budgetSchema = new Schema(
  {
    flights: { type: Number, required: true },
    accommodation: { type: Number, required: true },
    food: { type: Number, required: true },
    activities: { type: Number, required: true },
    localTransport: { type: Number, required: true },
    misc: { type: Number, required: true },
    currency: { type: String, required: true, default: "USD" },
    total: { type: Number, required: true },
  },
  { _id: false },
);

const hotelSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // budget | mid | luxury
    area: { type: String, required: false },
  },
  { _id: false },
);

const weatherSchema = new Schema(
  {
    summary: { type: String, required: true },
    fetchedAt: { type: Date, required: true },
    source: { type: String, required: true, default: "open-meteo" },
  },
  { _id: false },
);

const tripSchema = new Schema(
  {
    userId: { type: Types.ObjectId, required: true, index: true },
    destination: { type: String, required: true, trim: true },
    country: { type: String, required: false, trim: true },
    region: { type: String, required: false, trim: true },
    startDate: { type: Date, required: false },
    days: { type: Number, required: true, min: 1, max: 30 },
    budgetType: { type: String, required: true, enum: ["Low", "Medium", "High"] },
    interests: { type: [String], required: true, default: [] },
    itinerary: { type: [daySchema], required: true, default: [] },
    budget: { type: budgetSchema, required: false },
    hotels: { type: [hotelSchema], required: true, default: [] },
    weather: { type: weatherSchema, required: false },
    aiMeta: {
      provider: { type: String, required: false },
      model: { type: String, required: false },
      generatedAt: { type: Date, required: false },
    },
  },
  { timestamps: true },
);

export type Trip = InferSchemaType<typeof tripSchema>;
export type TripDoc = Trip & mongoose.Document;
export const TripModel =
  (mongoose.models.Trip as mongoose.Model<TripDoc> | undefined) ?? mongoose.model<TripDoc>("Trip", tripSchema);

