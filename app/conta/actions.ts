"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { type AIModelId, DEFAULT_AI_MODEL } from "@/lib/types";

const VALID_MODELS: AIModelId[] = ["claude", "gpt", "gemini"];

export interface PreferencesState {
  ok: boolean;
  message: string;
}

export async function updatePreferences(
  _prev: PreferencesState,
  formData: FormData,
): Promise<PreferencesState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }

  const rawModel = String(formData.get("defaultModel") ?? "");
  const defaultModel: AIModelId = VALID_MODELS.includes(rawModel as AIModelId)
    ? (rawModel as AIModelId)
    : DEFAULT_AI_MODEL;

  const name = String(formData.get("channelName") ?? "").trim();
  const handle = String(formData.get("channelHandle") ?? "").trim();
  const url = String(formData.get("channelUrl") ?? "").trim();

  // Channel is optional (RN01). Only persist it when at least a name is given.
  const channel = name ? { name, handle, url } : null;

  try {
    await connectToDatabase();
    await User.findByIdAndUpdate(session.user.id, { defaultModel, channel });
  } catch {
    return { ok: false, message: "Não foi possível salvar. Tente novamente." };
  }

  revalidatePath("/conta");
  return { ok: true, message: "Preferências salvas." };
}
