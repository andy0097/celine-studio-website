import type { Testimonial } from "@/sanity/lib/content-types";

/**
 * A testimonial as the quote sections take it. The attribution is the part
 * after "|" in "Homeowners | Family house, Cluj" (the home page shows all of it).
 */
export function quoteProps(q: Testimonial) {
  const project = q.project ?? "";
  return { quote: q.quote, name: q.name, initials: q.initials, project: project.split("|").pop()!.trim() };
}
