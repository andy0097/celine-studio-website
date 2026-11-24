/** A booking-form enquiry, as the form sends it and the leads table stores it. */

export const PROJECT_TYPES = ["residential", "horeca", "onSite"] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export type Lead = {
  name: string;
  email: string;
  phone: string | null;
  projectType: ProjectType;
  city: string | null;
  about: string | null;
  locale: "ro" | "en";
  sourcePage: string | null;
};

const LIMITS = { name: 200, email: 320, phone: 50, city: 200, about: 5000, sourcePage: 300 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(form: FormData, key: keyof typeof LIMITS) {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, LIMITS[key]);
  return trimmed || null;
}

/** The lead from the submitted form, or null when a required field is missing or malformed. */
export function parseLead(form: FormData, locale: "ro" | "en"): Lead | null {
  const name = text(form, "name");
  const email = text(form, "email");
  const projectType = form.get("type");
  if (!name || !email || !EMAIL.test(email)) return null;
  if (!PROJECT_TYPES.includes(projectType as ProjectType)) return null;
  return {
    name,
    email,
    phone: text(form, "phone"),
    projectType: projectType as ProjectType,
    city: text(form, "city"),
    about: text(form, "about"),
    locale,
    sourcePage: text(form, "sourcePage"),
  };
}
