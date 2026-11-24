import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/** Leaves the preview: back to published content on the same page. */
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  const back = request.nextUrl.searchParams.get("redirect") ?? "/";
  return NextResponse.redirect(new URL(back.startsWith("/") ? back : "/", request.url));
}
