import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, required: false, trim: true },
    bio: { type: String, required: false, trim: true, maxlength: 240 },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export type UserDoc = User & mongoose.Document;

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDoc> | undefined) ?? mongoose.model<UserDoc>("User", userSchema);

