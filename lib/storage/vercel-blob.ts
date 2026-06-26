import { put } from "@vercel/blob";

import { dataUrlToBlob } from "@/lib/storage/data-url";
import { type Storage, type UploadOptions, StorageError } from "@/lib/storage/types";

function buildPathname(opts: UploadOptions, defaultPrefix: string): string {
  const prefix = opts.bucket ?? defaultPrefix;
  const filename = opts.filename ?? "upload";
  if (!prefix) return filename;
  return `${prefix.replace(/\/+$/, "")}/${filename}`;
}

export class VercelBlobStorage implements Storage {
  constructor(private readonly defaultPrefix = "") {}

  async upload(data: Blob, opts: UploadOptions = {}): Promise<string> {
    const pathname = buildPathname(opts, this.defaultPrefix);
    try {
      const blob = await put(pathname, data, {
        access: "public",
        addRandomSuffix: true,
        contentType: opts.contentType ?? (data.type || undefined),
      });
      return blob.url;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload falhou.";
      throw new StorageError(message);
    }
  }

  async uploadDataUrl(dataUrl: string, opts: UploadOptions = {}): Promise<string> {
    const blob = dataUrlToBlob(dataUrl);
    return this.upload(blob, { contentType: blob.type, ...opts });
  }
}
