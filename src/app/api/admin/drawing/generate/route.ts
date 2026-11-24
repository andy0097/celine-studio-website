import { getAdmin, unauthorized } from "@/lib/admin/auth";
import { stylePrompt } from "@/lib/drawing/prompt";
import { defaultProvider, isProviderId, PROVIDERS, ProviderError } from "@/lib/drawing/providers";
import { loadSource, monthlyCap, releaseSlot, reserveSlot, uploadDrawing, writeClient } from "@/lib/drawing/sanity";

/** Image models take 10–60 s; give them room. */
export const maxDuration = 120;

type Body = { photoId?: string; assetId?: string; provider?: string; notes?: string; name?: string };

/**
 * Turns a photo into a sketch. Takes one slot of the monthly cap, sends the
 * photo to the chosen model and stores the result as an unattached image file
 * in Sanity; the admin reviews it and then saves it as the photo's sketch (or
 * discards it) from the Studio.
 */
export async function POST(request: Request) {
  const admin = await getAdmin(request);
  if (!admin) return unauthorized();
  const client = writeClient(request);
  if (!client) return unauthorized();

  const body = (await request.json().catch(() => ({}))) as Body;
  const providerId = isProviderId(body.provider) ? body.provider : defaultProvider();
  if (!providerId) {
    return Response.json(
      { error: "No image model is set up. Add GEMINI_API_KEY, REPLICATE_API_TOKEN or OPENAI_API_KEY to the environment." },
      { status: 503 },
    );
  }
  const provider = PROVIDERS[providerId];
  if (!provider.configured()) return Response.json({ error: `${provider.title} has no API key in the environment.` }, { status: 503 });
  if (!body.photoId && !body.assetId) return Response.json({ error: "Choose a photo first." }, { status: 400 });

  const source = await loadSource(client, body).catch((error) => {
    console.error("[admin/drawing] source", error);
    return null;
  });
  if (!source) return Response.json({ error: "Could not read that photo from Sanity." }, { status: 404 });

  const used = await reserveSlot(client);
  if (used === null) {
    return Response.json(
      { error: `This month's limit of ${monthlyCap()} drawings is reached. It resets on the 1st (DRAWING_MONTHLY_CAP).` },
      { status: 429 },
    );
  }

  try {
    const drawing = await provider.generate(source, stylePrompt(body.notes));
    const file = await uploadDrawing(client, drawing, { name: body.name || "photo", provider: providerId, model: provider.model() });
    console.info(`[admin/drawing] ${admin.name} generated a sketch with ${provider.model()} (${used}/${monthlyCap()})`);
    return Response.json({ ...file, provider: providerId, model: provider.model(), usage: { used, cap: monthlyCap() } });
  } catch (error) {
    await releaseSlot(client);
    console.error("[admin/drawing] generate", error);
    const message = error instanceof ProviderError ? error.message : "The drawing could not be generated.";
    return Response.json({ error: message }, { status: 502 });
  }
}
