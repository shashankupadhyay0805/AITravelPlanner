import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "./httpError.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: err.flatten(),
      },
    });
  }

  if (err instanceof HttpError) {
    if (err.status >= 500) {
      // eslint-disable-next-line no-console
      console.error("[api] http_error", { status: err.status, code: err.code, message: err.message, details: err.details });
    }
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // eslint-disable-next-line no-console
  console.error("[api] unhandled", err);
  return res.status(500).json({
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong" },
  });
};

