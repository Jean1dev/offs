// lib/projects.ts — project queries & mutations (data plane for F02).
// Server-only helpers; the "use server" action wrappers live in
// app/(app)/projetos/actions.ts and enforce auth/ownership.

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/models/Project";
import { Artifact } from "@/models/Artifact";
import { type ProjectStatus } from "@/lib/catalog";
import { type AIModelId } from "@/lib/types";

export interface ProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
  model: AIModelId;
  doneCount: number;
  artifactCount: number;
  updated: string;
}

export interface RecentProject {
  id: string;
  title: string;
  status: ProjectStatus;
}

/** Portuguese relative-time label (e.g. "há 2 horas"). */
export function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d} ${d === 1 ? "dia" : "dias"}`;
  const w = Math.floor(d / 7);
  if (w < 5) return `há ${w} ${w === 1 ? "semana" : "semanas"}`;
  const mo = Math.floor(d / 30);
  return `há ${mo} ${mo === 1 ? "mês" : "meses"}`;
}

/** All of a user's non-archived projects with active-artifact counts. */
export async function getProjectsForUser(
  userId: string,
): Promise<ProjectSummary[]> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);
  const projects = await Project.find({ userId: uid, archived: false })
    .sort({ updatedAt: -1 })
    .lean();

  const ids = projects.map((p) => p._id);
  const counts = ids.length
    ? await Artifact.aggregate<{ _id: Types.ObjectId; n: number }>([
        { $match: { projectId: { $in: ids }, status: "ativo" } },
        { $group: { _id: "$projectId", n: { $sum: 1 } } },
      ])
    : [];
  const countMap = new Map(counts.map((c) => [String(c._id), c.n]));

  return projects.map((p) => ({
    id: String(p._id),
    title: p.title,
    status: p.status as ProjectStatus,
    model: p.model as AIModelId,
    doneCount: (p.done ?? []).length,
    artifactCount: countMap.get(String(p._id)) ?? 0,
    updated: formatRelative(p.updatedAt as Date),
  }));
}

export interface ProjectDetail {
  id: string;
  title: string;
  status: ProjectStatus;
  model: AIModelId;
  done: string[];
  updated: string;
}

/** A single project owned by the user, or null. */
export async function getProjectById(
  userId: string,
  projectId: string,
): Promise<ProjectDetail | null> {
  if (!Types.ObjectId.isValid(projectId)) return null;
  await connectToDatabase();
  const p = await Project.findOne({
    _id: projectId,
    userId: new Types.ObjectId(userId),
    archived: false,
  }).lean();
  if (!p) return null;
  return {
    id: String(p._id),
    title: p.title,
    status: p.status as ProjectStatus,
    model: p.model as AIModelId,
    done: p.done ?? [],
    updated: formatRelative(p.updatedAt as Date),
  };
}

/** Most recently active projects for the sidebar. */
export async function getRecentProjects(
  userId: string,
  limit = 5,
): Promise<RecentProject[]> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);
  const projects = await Project.find({ userId: uid, archived: false })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select("title status")
    .lean();
  return projects.map((p) => ({
    id: String(p._id),
    title: p.title,
    status: p.status as ProjectStatus,
  }));
}

/** Creates an empty project and returns its id. */
export async function createProject(
  userId: string,
  model: AIModelId,
): Promise<string> {
  await connectToDatabase();
  const project = await Project.create({
    userId: new Types.ObjectId(userId),
    title: "Vídeo sem título",
    status: "ideia",
    model,
    done: [],
  });
  return String(project._id);
}

export async function renameProject(
  userId: string,
  projectId: string,
  title: string,
): Promise<void> {
  await connectToDatabase();
  await Project.updateOne(
    { _id: projectId, userId: new Types.ObjectId(userId) },
    { title: title.trim() || "Vídeo sem título" },
  );
}

/** Archives (never deletes — preserve history). */
export async function archiveProject(
  userId: string,
  projectId: string,
): Promise<void> {
  await connectToDatabase();
  await Project.updateOne(
    { _id: projectId, userId: new Types.ObjectId(userId) },
    { archived: true },
  );
}

/** Duplicates a project and its active artifacts into a fresh project. */
export async function duplicateProject(
  userId: string,
  projectId: string,
): Promise<string | null> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);
  const source = await Project.findOne({ _id: projectId, userId: uid });
  if (!source) return null;

  const copy = await Project.create({
    userId: uid,
    title: `${source.title} (cópia)`,
    status: source.status,
    model: source.model,
    done: source.done,
  });

  const active = await Artifact.find({
    projectId: source._id,
    status: "ativo",
  }).lean();
  for (const a of active) {
    await Artifact.createInitial({
      projectId: copy._id,
      name: a.name,
      agentId: a.agentId,
      model: a.model,
      content: a.content,
    });
  }

  return String(copy._id);
}
