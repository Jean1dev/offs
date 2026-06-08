// lib/seed.ts — load demo data into a user's account (dev only).
// Idempotent: wipes the user's existing projects + artifacts, then re-inserts.
// Triggered via app/api/dev/seed (guarded to non-production).

import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Project } from "@/models/Project";
import { Artifact } from "@/models/Artifact";
import { agentById } from "@/lib/catalog";
import { ARTIFACT_CONTENT, DEMO_PROJECTS } from "@/lib/demo-data";

export interface SeedResult {
  projects: number;
  artifacts: number;
}

export async function seedDemoData(userId: string): Promise<SeedResult> {
  await connectToDatabase();
  const uid = new Types.ObjectId(userId);

  // Idempotent wipe of this user's data.
  const existing = await Project.find({ userId: uid }).select("_id");
  const ids = existing.map((p) => p._id);
  if (ids.length) await Artifact.deleteMany({ projectId: { $in: ids } });
  await Project.deleteMany({ userId: uid });

  let projects = 0;
  let artifacts = 0;

  for (const dp of DEMO_PROJECTS) {
    const proj = await Project.create({
      userId: uid,
      title: dp.title,
      status: dp.status,
      model: dp.model,
      done: dp.done,
      archived: false,
    });
    projects++;

    for (const agentId of dp.done) {
      const content = ARTIFACT_CONTENT[agentId];
      if (!content) continue;

      const name = agentById(agentId)?.produces ?? agentId;
      const versionCount = dp.versions?.[agentId] ?? 1;

      let art = await Artifact.createInitial({
        projectId: proj._id,
        name,
        agentId,
        model: dp.model,
        content,
      });
      artifacts++;

      // Simulate regeneration history so the version switcher has something to show.
      for (let v = 2; v <= versionCount; v++) {
        art = await Artifact.regenerate(art.lineageId, {
          name,
          agentId,
          model: dp.model,
          content,
        });
      }
    }
  }

  return { projects, artifacts };
}
