import type { RequestHandler } from "express";
import { verifyAccessToken } from "./jwt.js";
import { HttpError } from "../http/httpError.js";

declare global {
  // eslint-disable-next-line no-var
  var __traoTypes: unknown;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string };
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError({ status: 401, code: "UNAUTHORIZED", message: "Missing token" }));
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new HttpError({ status: 401, code: "UNAUTHORIZED", message: "Invalid token" }));
  }
};

