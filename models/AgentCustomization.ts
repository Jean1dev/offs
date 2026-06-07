// models/AgentCustomization.ts — a user's override of a catalog agent (spec §2.5).
//
// A customization is an overlay, not a mutation of the default agent. Scope is either
// `global` (all of the user's projects) or `projeto` (one project, takes priority over
// global). The default is always restorable by deleting the overlay. Priority
// resolution (projeto > global) happens at execution time (Phase 3/6).

import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const AgentCustomizationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    agentId: { type: String, required: true },
    // Custom base prompt. Empty/absent => use the catalog default prompt.
    prompt: { type: String, default: "" },
    // Specific model for this agent. Absent => fall back to the model hierarchy.
    model: { type: String, enum: ["claude", "gpt", "gemini"], default: null },
    scope: { type: String, enum: ["global", "projeto"], required: true },
    // Required when scope === "projeto"; null for global overlays.
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

// One overlay per (user, agent, scope, project). Global overlays share projectId=null.
AgentCustomizationSchema.index(
  { userId: 1, agentId: 1, scope: 1, projectId: 1 },
  { unique: true },
);

AgentCustomizationSchema.pre("validate", function () {
  if (this.scope === "projeto" && !this.projectId) {
    throw new Error("Customização de escopo 'projeto' exige projectId.");
  }
  if (this.scope === "global") {
    this.projectId = null;
  }
});

export type AgentCustomizationDoc = InferSchemaType<
  typeof AgentCustomizationSchema
> & { _id: Types.ObjectId };

export const AgentCustomization: Model<AgentCustomizationDoc> =
  (mongoose.models.AgentCustomization as Model<AgentCustomizationDoc>) ??
  mongoose.model<AgentCustomizationDoc>(
    "AgentCustomization",
    AgentCustomizationSchema,
  );
