import { describe, it, expect } from "vitest";
import { resolveImageModel } from "@/lib/ai/image-models";
import { imageRealCostUsd, IMAGE_MODEL_PRICING } from "@/lib/credits";
import { DEFAULT_IMAGE_MODEL } from "@/lib/types";

// Hierarquia de modelo de imagem (RN-IMG01 — espelha RN06).
describe("resolveImageModel", () => {
  it("o nível mais específico que existe vence", () => {
    expect(
      resolveImageModel({
        execution: "nano-banana",
        customization: "gpt-image",
        project: "gpt-image",
      }),
    ).toBe("nano-banana");
    expect(
      resolveImageModel({ customization: "nano-banana", project: "gpt-image" }),
    ).toBe("nano-banana");
    expect(resolveImageModel({ project: "nano-banana" })).toBe("nano-banana");
  });

  it("cai no default quando nenhum nível está definido", () => {
    expect(resolveImageModel({})).toBe(DEFAULT_IMAGE_MODEL);
    expect(
      resolveImageModel({
        execution: null,
        customization: null,
        project: null,
        global: null,
      }),
    ).toBe(DEFAULT_IMAGE_MODEL);
  });
});

// Custo real por imagem (spec offs-geracao-imagem §9 / D08).
describe("imageRealCostUsd", () => {
  it("multiplica o preço por imagem pelo número de variações", () => {
    expect(imageRealCostUsd("nano-banana", 3)).toBeCloseTo(
      IMAGE_MODEL_PRICING["nano-banana"] * 3,
      6,
    );
    expect(imageRealCostUsd("gpt-image", 2)).toBeCloseTo(
      IMAGE_MODEL_PRICING["gpt-image"] * 2,
      6,
    );
  });

  it("é zero sem imagens", () => {
    expect(imageRealCostUsd("gpt-image", 0)).toBe(0);
  });

  it("calibragem é por modelo — os preços diferem entre providers", () => {
    expect(IMAGE_MODEL_PRICING["gpt-image"]).not.toBe(
      IMAGE_MODEL_PRICING["nano-banana"],
    );
  });
});
