import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const putMock = vi.fn();

vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => putMock(...args),
}));

describe("VercelBlobStorage", () => {
  beforeEach(() => {
    putMock.mockReset();
    putMock.mockResolvedValue({
      url: "https://example.public.blob.vercel-storage.com/offs-thumbnails/thumbnail-1-abc.png",
    });
  });

  it("upload envia pathname com prefixo, access public e addRandomSuffix", async () => {
    const { VercelBlobStorage } = await import("@/lib/storage/vercel-blob");
    const storage = new VercelBlobStorage("offs");

    const data = new Blob(["png"], { type: "image/png" });
    const url = await storage.upload(data, {
      bucket: "offs-thumbnails",
      filename: "thumbnail-1.png",
      contentType: "image/png",
    });

    expect(putMock).toHaveBeenCalledWith("offs-thumbnails/thumbnail-1.png", data, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/png",
    });
    expect(url).toBe(
      "https://example.public.blob.vercel-storage.com/offs-thumbnails/thumbnail-1-abc.png",
    );
  });

  it("uploadDataUrl decodifica base64 e delega para upload", async () => {
    const { VercelBlobStorage } = await import("@/lib/storage/vercel-blob");
    const storage = new VercelBlobStorage();

    const dataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const url = await storage.uploadDataUrl(dataUrl, {
      bucket: "offs-prints",
      filename: "print-1.png",
    });

    expect(putMock).toHaveBeenCalledOnce();
    const [pathname, body, options] = putMock.mock.calls[0];
    expect(pathname).toBe("offs-prints/print-1.png");
    expect(body).toBeInstanceOf(Blob);
    expect((body as Blob).type).toBe("image/png");
    expect(options).toMatchObject({
      access: "public",
      addRandomSuffix: true,
      contentType: "image/png",
    });
    expect(url).toContain("blob.vercel-storage.com");
  });

  it("relança StorageError quando put falha", async () => {
    const { VercelBlobStorage } = await import("@/lib/storage/vercel-blob");
    const { StorageError } = await import("@/lib/storage/types");
    putMock.mockRejectedValue(new Error("token inválido"));

    const storage = new VercelBlobStorage();
    await expect(storage.upload(new Blob(["x"]))).rejects.toBeInstanceOf(StorageError);
  });
});

describe("getStorage", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.STORAGE_API_URL;
    delete process.env.STORAGE_BUCKET;
    vi.resetModules();
  });

  afterEach(() => {
    process.env = env;
  });

  it("prioriza Vercel Blob quando BLOB_READ_WRITE_TOKEN está definido", async () => {
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_rw_test";
    process.env.STORAGE_API_URL = "https://s3-api.example.com";
    process.env.STORAGE_BUCKET = "offs";

    const { getStorage } = await import("@/lib/storage");
    const { VercelBlobStorage } = await import("@/lib/storage/vercel-blob");

    const storage = getStorage();
    expect(storage).toBeInstanceOf(VercelBlobStorage);
  });

  it("usa S3 API quando só STORAGE_API_URL está definido", async () => {
    process.env.STORAGE_API_URL = "https://s3-api.example.com/";
    process.env.STORAGE_BUCKET = "offs";

    const { getStorage } = await import("@/lib/storage");
    const { S3ApiStorage } = await import("@/lib/storage/s3-api");

    const storage = getStorage();
    expect(storage).toBeInstanceOf(S3ApiStorage);
  });

  it("retorna null quando nenhum backend está configurado", async () => {
    const { getStorage } = await import("@/lib/storage");
    expect(getStorage()).toBeNull();
  });
});

describe("dataUrlToBlob", () => {
  it("rejeita data URL inválida", async () => {
    const { dataUrlToBlob } = await import("@/lib/storage/data-url");
    const { StorageError } = await import("@/lib/storage/types");

    expect(() => dataUrlToBlob("not-a-data-url")).toThrow(StorageError);
  });
});
