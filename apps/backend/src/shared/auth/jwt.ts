import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AccessTokenPayload = {
  sub: string; // userId
};

export function signAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: config.JWT_ACCESS_TTL as any });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessTokenPayload & jwt.JwtPayload;
}

