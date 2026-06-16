// models/Artifact.ts — everything an agent produces, versioned (spec §2.3).
//
// Versioning (RN05): an artifact is NEVER overwritten. Each "logical artifact" is a
// lineage (grouped by `lineageId`); regenerating archives the current active version
// and inserts a new one with version+1. Exactly one version per lineage is `ativo`.
// The user can view previous versions and promote one back to active.

import mongoose, { Schema, type Model, type Types } from "mongoose";
import type { ArtifactModelId } from "@/lib/types";
import type { ArtifactContent } from "@/lib/artifact-content";

export type ArtifactStatus = "ativo" | "arquivado";

export interface ArtifactDoc {
  _id: Types.ObjectId;
  projectId: Types.ObjectId;
  lineageId: Types.ObjectId;
  name: string;
  agentId: string;
  model: ArtifactModelId;
  version: number;
  status: ArtifactStatus;
  content: ArtifactContent;
  /** URLs of source prints persisted to storage (RN04). */
  inputImages: string[];
  createdAt: Date;
  updatedAt: Date;
}

/** Fields needed to create a new artifact (initial version or a regeneration). */
export interface ArtifactInput {
  projectId: Types.ObjectId | string;
  name: string;
  agentId: string;
  model: ArtifactModelId;
  content: ArtifactContent;
  inputImages?: string[];
}

interface ArtifactModel extends Model<ArtifactDoc> {
  /** Creates the first version (v1, active) of a new logical artifact. */
  createInitial(input: ArtifactInput): Promise<ArtifactDoc>;
  /** Archives the current active version and inserts the next one (RN05). */
  regenerate(
    lineageId: Types.ObjectId | string,
    input: Omit<ArtifactInput, "projectId"> & {
      projectId?: Types.ObjectId | string;
    },
  ): Promise<ArtifactDoc>;
  /** Makes a specific version active and archives the others in its lineage. */
  promote(artifactId: Types.ObjectId | string): Promise<ArtifactDoc | null>;
  /**
   * Multi-output (spec offs-geracao-imagem §8): persists N variations as N versions
   * of one lineage in a single execution. The first variation becomes active, the
   * rest archived — the user promotes another via the existing version mechanism.
   * When `lineageId` is given it appends to an existing lineage (regeneration),
   * archiving its current active version first. Returns the active version.
   */
  createVariations(
    input: Omit<ArtifactInput, "content">,
    variations: ArtifactContent[],
    opts?: { lineageId?: Types.ObjectId | string },
  ): Promise<ArtifactDoc>;
}

const ArtifactSchema = new Schema<ArtifactDoc, ArtifactModel>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    lineageId: { type: Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    agentId: { type: String, required: true },
    model: {
      type: String,
      enum: ["claude", "claude-sonnet", "claude-haiku", "gpt", "gpt-mini", "gemini", "gemini-flash", "gpt-image", "nano-banana"],
      required: true,
    },
    version: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["ativo", "arquivado"],
      default: "ativo",
      index: true,
    },
    content: {
      summary: { type: String, default: "" },
      blocks: { type: [Schema.Types.Mixed], default: [] },
    },
    inputImages: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false },
);

// One active version per lineage (the active artifact a lineage resolves to).
ArtifactSchema.index(
  { lineageId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "ativo" } },
);

ArtifactSchema.statics.createInitial = async function (
  this: ArtifactModel,
  input: ArtifactInput,
): Promise<ArtifactDoc> {
  const lineageId = new mongoose.Types.ObjectId();
  return this.create({
    projectId: input.projectId,
    lineageId,
    name: input.name,
    agentId: input.agentId,
    model: input.model,
    version: 1,
    status: "ativo",
    content: input.content,
    inputImages: input.inputImages ?? [],
  });
};

ArtifactSchema.statics.regenerate = async function (
  this: ArtifactModel,
  lineageId: Types.ObjectId | string,
  input: Omit<ArtifactInput, "projectId"> & {
    projectId?: Types.ObjectId | string;
  },
): Promise<ArtifactDoc> {
  const current = await this.findOne({ lineageId, status: "ativo" });
  const projectId = input.projectId ?? current?.projectId;
  if (!projectId) {
    throw new Error("regenerate: lineage não encontrada e projectId ausente.");
  }

  // Archive the current active version first to keep the unique-active invariant.
  if (current) {
    current.status = "arquivado";
    await current.save();
  }

  const max = await this.findOne({ lineageId })
    .sort({ version: -1 })
    .select("version");
  const nextVersion = (max?.version ?? 0) + 1;

  return this.create({
    projectId,
    lineageId,
    name: input.name,
    agentId: input.agentId,
    model: input.model,
    version: nextVersion,
    status: "ativo",
    content: input.content,
    inputImages: input.inputImages ?? [],
  });
};

ArtifactSchema.statics.createVariations = async function (
  this: ArtifactModel,
  input: Omit<ArtifactInput, "content">,
  variations: ArtifactContent[],
  opts: { lineageId?: Types.ObjectId | string } = {},
): Promise<ArtifactDoc> {
  if (variations.length === 0) {
    throw new Error("createVariations: nenhuma variação fornecida.");
  }

  // Existing lineage (regeneration) or a fresh one.
  let lineageId: Types.ObjectId;
  let baseVersion = 0;
  if (opts.lineageId) {
    lineageId =
      typeof opts.lineageId === "string"
        ? new mongoose.Types.ObjectId(opts.lineageId)
        : opts.lineageId;
    // Keep the unique-active invariant: archive the current active version first.
    await this.updateMany(
      { lineageId, status: "ativo" },
      { status: "arquivado" },
    );
    const max = await this.findOne({ lineageId })
      .sort({ version: -1 })
      .select("version");
    baseVersion = max?.version ?? 0;
  } else {
    lineageId = new mongoose.Types.ObjectId();
  }

  // First variation is active; the rest are archived siblings of the same lineage.
  const docs = variations.map((content, i) => ({
    projectId: input.projectId,
    lineageId,
    name: input.name,
    agentId: input.agentId,
    model: input.model,
    version: baseVersion + i + 1,
    status: (i === 0 ? "ativo" : "arquivado") as ArtifactStatus,
    content,
    inputImages: input.inputImages ?? [],
  }));

  const created = await this.insertMany(docs);
  return created[0] as unknown as ArtifactDoc;
};

ArtifactSchema.statics.promote = async function (
  this: ArtifactModel,
  artifactId: Types.ObjectId | string,
): Promise<ArtifactDoc | null> {
  const target = await this.findById(artifactId);
  if (!target) return null;

  await this.updateMany(
    { lineageId: target.lineageId, _id: { $ne: target._id } },
    { status: "arquivado" },
  );
  target.status = "ativo";
  await target.save();
  return target;
};

export const Artifact: ArtifactModel =
  (mongoose.models.Artifact as ArtifactModel) ??
  mongoose.model<ArtifactDoc, ArtifactModel>("Artifact", ArtifactSchema);
