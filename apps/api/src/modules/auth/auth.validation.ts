import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});

export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatarUrl: z.string().url().max(1000).or(z.literal("")).optional(),
  bio: z.string().max(240).optional(),
});

