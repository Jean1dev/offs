import { StorageError } from "@/lib/storage/types";

export function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(dataUrl);
  if (!match) throw new StorageError("Data URL inválida (esperado base64).");
  const [, mime, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  return new Blob([bytes], { type: mime });
}
