import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./shared/config.js";
import { notFoundHandler } from "./shared/http/notFound.js";
import { errorHandler } from "./shared/http/errorHandler.js";
import { authRouter } from "./modules/auth/auth.router.js";
import { holidaysRouter } from "./modules/holidays/holidays.router.js";
import { tripsRouter } from "./modules/trips/trips.router.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/holidays", holidaysRouter);
  app.use("/api/trips", tripsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

