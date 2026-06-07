// lib/artifacts.ts — artifact detail + versioning helpers (F09/F11).

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/models/Project";
import { Artifact, type ArtifactStatus } from "@/models/Artifact";
import { formatRelative } from "@/lib/projects";
import type { AIModelId } from "@/lib/types";
import type { ArtifactContent } from "@/lib/artifact-content";

export interface ArtifactVersionRef {
  id: string;
  version: number;
  status: ArtifactStatus;
  when: string;
}

export interface ArtifactDetail {
  id: string;
  projectId: string;
  name: string;
  agentId: string;
  model: AIModelId;
  version: number;
  status: ArtifactStatus;
  content: ArtifactContent;
  when: string;
  versions: ArtifactVersionRef[];
}

export async function getArtifactDetail(
  userId: string,
  projectId: string,
  artifactId: string,
): Promise<ArtifactDetail | null> {
  if (!Types.ObjectId.isValid(projectId) || !Types.ObjectId.isValid(artifactId))
    return null;
  await connectToDatabase();

  const owns = await Project.exists({
    _id: projectId,
    userId: new Types.ObjectId(userId),
  });
  if (!owns) return null;

  const art = await Artifact.findOne({ _id: artifactId, projectId }).lean();
  if (!art) return null;

  const versions = await Artifact.find({ lineageId: art.lineageId })
    .sort({ version: -1 })
    .lean();

  return {
    id: String(art._id),
    projectId: String(art.projectId),
    name: art.name,
    agentId: art.agentId,
    model: art.model as AIModelId,
    version: art.version,
    status: art.status,
    content: art.content,
    when: formatRelative(art.updatedAt),
    versions: versions.map((v) => ({
      id: String(v._id),
      version: v.version,
      status: v.status,
      when: formatRelative(v.updatedAt),
    })),
  };
}

export async function renameArtifact(
  userId: string,
  projectId: string,
  artifactId: string,
  name: string,
): Promise<void> {
  await connectToDatabase();
  const owns = await Project.exists({
    _id: projectId,
    userId: new Types.ObjectId(userId),
  });
  if (!owns) return;
  await Artifact.updateOne(
    { _id: artifactId, projectId },
    { name: name.trim() || "Artefato" },
  );
}

/** Promotes a previous version to active (F11), archiving the others. */
export async function promoteArtifactVersion(
  userId: string,
  projectId: string,
  artifactId: string,
): Promise<void> {
  await connectToDatabase();
  const owns = await Project.exists({
    _id: projectId,
    userId: new Types.ObjectId(userId),
  });
  if (!owns) return;
  const art = await Artifact.findOne({ _id: artifactId, projectId }).select("_id");
  if (!art) return;
  await Artifact.promote(artifactId);
}
