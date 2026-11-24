import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Language routing: sends visitors to their language, maps translated
 * slugs to the internal pages and remembers the choice in a cookie.
 * (Next.js 16 calls this file proxy.ts; it used to be middleware.ts.)
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, /admin (the backend, one
  // language) and files with an extension (images, fonts, robots.txt…).
  matcher: ["/((?!api|_next|_vercel|admin|.*\\..*).*)"],
};
