// models/User.ts — Mongoose view over the Auth.js `users` collection.
// The Auth.js MongoDBAdapter owns user creation/auth fields; this model adds the
// app's global preferences (default AI model, optional channel) on the same docs.
// strict:false keeps adapter-managed fields intact; versionKey:false avoids __v.

import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { DEFAULT_AI_MODEL } from "@/lib/types";

const ChannelSchema = new Schema(
  {
    name: { type: String, required: true },
    handle: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    name: String,
    email: String,
    image: String,
    emailVerified: Date,
    defaultModel: {
      type: String,
      enum: ["claude", "claude-sonnet", "claude-haiku", "gpt", "gpt-mini", "gemini", "gemini-flash"],
      default: DEFAULT_AI_MODEL,
    },
    channel: { type: ChannelSchema, default: null },
  },
  {
    collection: "users",
    versionKey: false,
    strict: false,
    timestamps: false,
  },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) ??
  mongoose.model<UserDoc>("User", UserSchema);
