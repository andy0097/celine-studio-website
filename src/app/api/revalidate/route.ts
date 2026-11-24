import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CONTENT_TAG } from "@/sanity/lib/fetch";

/**
 * Publish webhook (Sanity → manage → API → Webhooks, POST to /api/revalidate,
 * secret = SANITY_REVALIDATE_SECRET). Sanity Live already refreshes the exact
 * pages while someone has the site open; this backstop marks all content as
 * stale on every publish, so the next visitor gets fresh pages even when
 * nobody was online.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret, true);
  if (!isValidSignature) return NextResponse.json({ message: "Invalid signature" }, { status: 401 });

  revalidateTag(CONTENT_TAG, "max");
  return NextResponse.json({ revalidated: true, type: body?._type ?? null });
}
