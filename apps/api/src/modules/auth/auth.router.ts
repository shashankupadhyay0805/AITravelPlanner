import { Router } from "express";
import { requireAuth } from "../../shared/auth/requireAuth.js";
import { loginSchema, registerSchema, updateProfileSchema } from "./auth.validation.js";
import { getMe, loginUser, registerUser, updateMe } from "./auth.service.js";
import { signAccessToken } from "../../shared/auth/jwt.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);
    const user = await registerUser(body);
    const accessToken = signAccessToken({ sub: user.id });
    return res.status(201).json({ user, accessToken });
  } catch (err) {
    return next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await loginUser(body);
    const accessToken = signAccessToken({ sub: user.id });
    return res.json({ user, accessToken });
  } catch (err) {
    return next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await getMe(req.user!.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

authRouter.put("/me", requireAuth, async (req, res, next) => {
  try {
    const body = updateProfileSchema.parse(req.body);
    const user = await updateMe(req.user!.id, body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

