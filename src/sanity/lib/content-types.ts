/** Result shapes of the queries in queries.ts (what the components receive). */

export type Img = {
  src: string | null;
  alt: string | null;
  sketch: string | null;
  hotspot: { x: number; y: number } | null;
  caption: string | null;
};

export type CaseStudyCard = {
  _id: string;
  title: string;
  slug: string;
  category: "residential" | "horeca";
  number: string | null;
  summary: string | null;
  location: string | null;
  year: number | null;
  area: string | null;
  hasPage: boolean;
  image: Img | null;
};

export type Testimonial = {
  _id: string;
  quote: string;
  name: string;
  initials: string;
  project: string | null;
  image: Img | null;
};

export type FaqItem = { q: string; a: string };
export type Titled = { title: string; text: string | null };
export type Seo = { title: string | null; description: string | null; image: string | null } | null;
/** A case study a slide or venue links to (`p`: it has its own page). */
export type CaseLink = { s: string; p: boolean } | null;

export type Settings = {
  contact: { email: string; phone: string | null; address: string | null; instagram: string | null } | null;
  services: Titled[] | null;
  servicesIntro: { title: string | null; text: string | null } | null;
  onSite: { duration: string | null; fee: string | null } | null;
  cta: { fig: string | null; title: string; buttonLabel: string } | null;
  footer: {
    projects: CaseStudyCard[] | null;
    tagline: string | null;
    newsletterTitle: string | null;
    newsletterText: string | null;
    legalLinks: { label: string; kind: "page" | "caseStudy" | "external"; page: string | null; url: string | null; slug: string | null }[] | null;
  } | null;
  seo: Seo;
};

export type HomeContent = {
  hero: {
    tagline: string | null;
    ctaLabel: string | null;
    slides: { _key: string; title: string; location: string | null; image: Img | null; panel: Img | null; slug: CaseLink }[] | null;
  } | null;
  categories: { residential: CaseStudyCard[] | null; horeca: CaseStudyCard[] | null } | null;
  customElements: { title: string | null; items: { _key: string; title: string; image: Img | null }[] | null } | null;
  process: { title: string | null; paragraphs: string[] | null; ctaLabel: string | null; image: Img | null } | null;
  testimonials: { title: string | null; items: Testimonial[] | null } | null;
  seo: Seo;
};

export type ResidentialContent = {
  hero: { eyebrow: string | null; title: string; intro: string | null; services: string[] | null; ctaLabel: string | null; image: Img | null } | null;
  projects: { title: string | null; items: CaseStudyCard[] | null } | null;
  onSite: { title: string; text: string | null; ctaLabel: string | null; image: Img | null } | null;
  testimonial: Testimonial | null;
  seo: Seo;
};

export type HorecaContent = {
  hero: {
    eyebrow: string | null;
    title: string;
    intro: string | null;
    text: string | null;
    ctaLabel: string | null;
    image: Img | null;
    imageNote: string | null;
  } | null;
  venues: { title: string | null; note: string | null; items: { _key: string; title: string; image: Img | null; tall: boolean | null; slug: CaseLink }[] | null } | null;
  services: { title: string | null; text: string | null } | null;
  testimonial: { eyebrow: string | null; item: Testimonial | null } | null;
  seo: Seo;
};

export type ProcessContent = {
  hero: { eyebrow: string | null; title: string; intro: string | null; note: string | null; ctaLabel: string | null } | null;
  steps: { _key: string; title: string; text: string | null; receive: string[] | null }[] | null;
  services: { title: string | null; text: string | null } | null;
  faq: { title: string | null; items: FaqItem[] | null } | null;
  seo: Seo;
};

export type StudioContent = {
  hero: { eyebrow: string | null; title: string; intro: string | null; image: Img | null; since: string | null } | null;
  philosophy: { eyebrow: string | null; title: string | null; intro: string | null; principles: Titled[] | null } | null;
  work: { title: string | null; images: { _key: string; tall: boolean | null; image: Img | null }[] | null; ctaLabel: string | null } | null;
  team: {
    eyebrow: string | null;
    title: string | null;
    members: { _id: string; name: string; role: string | null; bio: string | null; portrait: Img | null }[] | null;
  } | null;
  seo: Seo;
};

export type OnSiteContent = {
  hero: { eyebrow: string | null; title: string; intro: string | null; ctaLabel: string | null; image: Img | null } | null;
  visit: { title: string; steps: Titled[] | null } | null;
  faq: { title: string | null; items: FaqItem[] | null } | null;
  seo: Seo;
};

export type BookContent = {
  hero: { eyebrow: string | null; title: string; intro: string | null; image: Img | null } | null;
  testimonials: Testimonial[] | null;
  faq: { eyebrow: string | null; title: string | null; items: FaqItem[] | null } | null;
  seo: Seo;
};

/** Portable Text, rendered with @portabletext/react (next-sanity re-exports it). */
export type Blocks = { _key: string; _type: string; [k: string]: unknown }[];

export type PrivacyContent = {
  title: string;
  updated: string | null;
  sections: { _key: string; title: string; anchor: string | null; body: Blocks | null }[] | null;
  note: string | null;
  seo: Seo;
};

export type CaseStudySection =
  | { _key: string; _type: "conceptSection"; intro: SectionIntro | null; points: string[] | null; sketch: Img | null }
  | { _key: string; _type: "valueSection"; intro: SectionIntro | null; items: Titled[] | null }
  | { _key: string; _type: "resultsSection"; intro: SectionIntro | null; items: { value: string; label: string }[] | null }
  | { _key: string; _type: "testimonialSection"; eyebrow: string | null; testimonial: Testimonial | null };

export type SectionIntro = { eyebrow: string | null; title: string | null; text: string | null };

export type CaseStudyContent = CaseStudyCard & {
  slugs: { ro: string; en: string };
  lead: string | null;
  hero: Img | null;
  specs: { label: string; value: string }[] | null;
  gallery: { _key: string; wide: boolean | null; image: Img | null }[] | null;
  galleryNote: string | null;
  sections: CaseStudySection[] | null;
  next: CaseStudyCard | null;
  seo: Seo;
};
