import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { HttpError } from "../../shared/http/httpError.js";
import { UserModel } from "./user.model.js";

type PublicUser = { id: string; name: string; email: string; avatarUrl?: string; bio?: string };

function toPublicUser(user: {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
}): PublicUser {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    bio: user.bio ?? undefined,
  };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await UserModel.findOne({ email: input.email }).lean();
  if (existing) {
    throw new HttpError({ status: 409, code: "EMAIL_IN_USE", message: "Email already registered" });
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });
  return toPublicUser(user);
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await UserModel.findOne({ email: input.email });
  if (!user) {
    throw new HttpError({ status: 401, code: "INVALID_CREDENTIALS", message: "Invalid credentials" });
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError({ status: 401, code: "INVALID_CREDENTIALS", message: "Invalid credentials" });
  }
  return toPublicUser(user);
}

export async function getMe(userId: string) {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new HttpError({ status: 404, code: "USER_NOT_FOUND", message: "User not found" });
  return toPublicUser(user as any);
}

export async function updateMe(
  userId: string,
  input: { name?: string; avatarUrl?: string; bio?: string },
) {
  const updated = await UserModel.findByIdAndUpdate(
    userId,
    {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || undefined } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
    },
    { new: true },
  ).lean();

  if (!updated) throw new HttpError({ status: 404, code: "USER_NOT_FOUND", message: "User not found" });
  return toPublicUser(updated as any);
}

