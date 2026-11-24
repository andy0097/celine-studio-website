import "server-only";

/**
 * Image-to-image models that can turn a photo into a sketch. Each one is
 * switched on by its API key; the admin tool lets you pick one per run, so
 * they can be compared on real project photos (plan 6.1).
 */

export type ProviderId = "gemini" | "replicate" | "openai";

export type SourceImage = { bytes: Buffer; mimeType: string; width?: number; height?: number };
export type Drawing = { bytes: Buffer; mimeType: string };

type Provider = {
  id: ProviderId;
  title: string;
  /** Rough price per image, for the admin screen. */
  cost: string;
  model: () => string;
  configured: () => boolean;
  generate: (source: SourceImage, prompt: string) => Promise<Drawing>;
};

export class ProviderError extends Error {}

async function failure(provider: string, res: Response): Promise<never> {
  const text = await res.text().catch(() => "");
  console.error(`[drawing] ${provider} ${res.status}: ${text.slice(0, 1000)}`);
  throw new ProviderError(`${provider} answered ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
}

const dataUrl = (img: SourceImage) => `data:${img.mimeType};base64,${img.bytes.toString("base64")}`;

/**
 * Google Gemini image model ("Nano Banana"): keeps the input's aspect ratio.
 * The studio's chosen provider (Nov 24). No free API tier; ≈ $0.039 per image.
 * gemini-2.5-flash-image is due to retire on 2027-03-15: set GEMINI_IMAGE_MODEL
 * to its successor then.
 */
const gemini: Provider = {
  id: "gemini",
  title: "Google Gemini",
  cost: "≈ $0.04",
  model: () => process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
  configured: () => Boolean(process.env.GEMINI_API_KEY),
  async generate(source, prompt) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model())}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY! },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ inline_data: { mime_type: source.mimeType, data: source.bytes.toString("base64") } }, { text: prompt }],
            },
          ],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
      },
    );
    if (!res.ok) return failure("Gemini", res);
    type Part = { inlineData?: { mimeType: string; data: string }; inline_data?: { mime_type: string; data: string } };
    const json = (await res.json()) as { candidates?: { content?: { parts?: Part[] }; finishReason?: string }[] };
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData ?? (part.inline_data && { mimeType: part.inline_data.mime_type, data: part.inline_data.data });
      if (inline?.data) return { bytes: Buffer.from(inline.data, "base64"), mimeType: inline.mimeType || "image/png" };
    }
    throw new ProviderError(`Gemini returned no image (${json.candidates?.[0]?.finishReason ?? "no candidates"})`);
  },
};

/** FLUX Kontext on Replicate: an edit model that keeps the composition; output matches the input's aspect ratio. */
const replicate: Provider = {
  id: "replicate",
  title: "FLUX Kontext (Replicate)",
  cost: "≈ $0.04–0.08",
  model: () => process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-kontext-pro",
  configured: () => Boolean(process.env.REPLICATE_API_TOKEN),
  async generate(source, prompt) {
    const headers = { authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`, "content-type": "application/json" };
    const res = await fetch(`https://api.replicate.com/v1/models/${this.model()}/predictions`, {
      method: "POST",
      headers: { ...headers, prefer: "wait=60" },
      body: JSON.stringify({
        input: { prompt, input_image: dataUrl(source), aspect_ratio: "match_input_image", output_format: "png", safety_tolerance: 2 },
      }),
    });
    if (!res.ok) return failure("Replicate", res);
    type Prediction = { status: string; output?: string | string[]; error?: string; urls?: { get?: string } };
    let prediction = (await res.json()) as Prediction;
    // Prefer: wait usually returns the finished prediction; poll for the rest (up to ~90 s more).
    for (let i = 0; i < 45 && !["succeeded", "failed", "canceled"].includes(prediction.status); i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(prediction.urls!.get!, { headers });
      if (!poll.ok) return failure("Replicate", poll);
      prediction = (await poll.json()) as Prediction;
    }
    if (prediction.status !== "succeeded") throw new ProviderError(`Replicate: ${prediction.error ?? prediction.status}`);
    const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    if (!url) throw new ProviderError("Replicate returned no image");
    const file = await fetch(url);
    if (!file.ok) return failure("Replicate (download)", file);
    return { bytes: Buffer.from(await file.arrayBuffer()), mimeType: file.headers.get("content-type") || "image/png" };
  },
};

/** OpenAI image model. Only three output sizes, so the framing can shift on unusual aspect ratios. */
const openai: Provider = {
  id: "openai",
  title: "OpenAI",
  cost: "≈ $0.04–0.17",
  model: () => process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
  configured: () => Boolean(process.env.OPENAI_API_KEY),
  async generate(source, prompt) {
    const ratio = source.width && source.height ? source.width / source.height : 1;
    const size = ratio > 1.2 ? "1536x1024" : ratio < 0.83 ? "1024x1536" : "1024x1024";
    const form = new FormData();
    form.append("model", this.model());
    form.append("prompt", prompt);
    form.append("size", size);
    form.append("quality", process.env.OPENAI_IMAGE_QUALITY || "high");
    form.append("input_fidelity", "high");
    const ext = source.mimeType.split("/")[1] || "png";
    form.append("image", new Blob([new Uint8Array(source.bytes)], { type: source.mimeType }), `photo.${ext}`);
    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });
    if (!res.ok) return failure("OpenAI", res);
    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new ProviderError("OpenAI returned no image");
    return { bytes: Buffer.from(b64, "base64"), mimeType: "image/png" };
  },
};

export const PROVIDERS: Record<ProviderId, Provider> = { gemini, replicate, openai };

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === "string" && value in PROVIDERS;
}

/** What the admin screen shows: every provider, and whether its key is set. */
export function providerList() {
  return Object.values(PROVIDERS).map((p) => ({ id: p.id, title: p.title, model: p.model(), cost: p.cost, ready: p.configured() }));
}

/** DRAWING_PROVIDER if it is set up, else the first provider with a key (Gemini first: Andrei's choice, Nov 24). */
export function defaultProvider(): ProviderId | null {
  const wanted = process.env.DRAWING_PROVIDER;
  if (isProviderId(wanted) && PROVIDERS[wanted].configured()) return wanted;
  return Object.values(PROVIDERS).find((p) => p.configured())?.id ?? null;
}
