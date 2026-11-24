import { getAdmin, unauthorized } from "@/lib/admin/auth";
import { DEFAULT_PROMPT } from "@/lib/drawing/prompt";
import { defaultProvider, providerList } from "@/lib/drawing/providers";
import { monthlyCap, usedThisMonth, writeClient } from "@/lib/drawing/sanity";

/** Drawing generator status: which models are set up, and this month's usage against the cap. */
export async function GET(request: Request) {
  if (!(await getAdmin(request))) return unauthorized();
  const client = writeClient(request);
  const used = client ? await usedThisMonth(client).catch(() => 0) : 0;
  return Response.json({
    providers: providerList(),
    defaultProvider: defaultProvider(),
    usage: { used, cap: monthlyCap() },
    customPrompt: Boolean(process.env.DRAWING_STYLE_PROMPT?.trim()),
    prompt: process.env.DRAWING_STYLE_PROMPT?.trim() || DEFAULT_PROMPT,
  });
}
