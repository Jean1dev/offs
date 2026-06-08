// lib/storage/s3-api.ts — Storage backed by the internal S3 API.
//
//   POST {baseUrl}/v1/s3?bucket={bucket}   (multipart/form-data, field "file")
//   → 200 OK with the file URL/identifier as plain text.

import { type Storage, type UploadOptions, StorageError } from "@/lib/storage/types";

function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(dataUrl);
  if (!match) throw new StorageError("Data URL inválida (esperado base64).");
  const [, mime, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  return new Blob([bytes], { type: mime });
}

export class S3ApiStorage implements Storage {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultBucket: string,
  ) {}

  async upload(data: Blob, opts: UploadOptions = {}): Promise<string> {
    const form = new FormData();
    form.append("file", data, opts.filename ?? "upload");

    const bucket = opts.bucket ?? this.defaultBucket;
    const query = bucket ? `?bucket=${encodeURIComponent(bucket)}` : "";

    const res = await fetch(`${this.baseUrl}/v1/s3${query}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      throw new StorageError(`Upload falhou (HTTP ${res.status}).`);
    }
    return (await res.text()).trim();
  }

  async uploadDataUrl(dataUrl: string, opts: UploadOptions = {}): Promise<string> {
    const blob = dataUrlToBlob(dataUrl);
    return this.upload(blob, { contentType: blob.type, ...opts });
  }
}
