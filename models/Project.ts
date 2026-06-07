// models/Project.ts — a project is a video in production (spec §2.2).
// Status advances manually (RN: no auto-advance). Projects are archived, never
// deleted, to preserve history. `done[]` tracks which agents have run.

import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";
import { DEFAULT_AI_MODEL } from "@/lib/types";

const ProjectSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["ideia", "roteiro", "producao", "publicado"],
      default: "ideia",
    },
    model: {
      type: String,
      enum: ["claude", "gpt", "gemini"],
      default: DEFAULT_AI_MODEL,
    },
    // Agent ids already executed in this project.
    done: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
  },
  {
    // createdAt + updatedAt; updatedAt doubles as "última atividade".
    timestamps: true,
    versionKey: false,
  },
);

export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Project: Model<ProjectDoc> =
  (mongoose.models.Project as Model<ProjectDoc>) ??
  mongoose.model<ProjectDoc>("Project", ProjectSchema);
