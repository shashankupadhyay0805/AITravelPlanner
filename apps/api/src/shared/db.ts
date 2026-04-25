import mongoose from "mongoose";
import { config } from "./config.js";

export async function connectMongo() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log("[api] connected to mongo");
}

