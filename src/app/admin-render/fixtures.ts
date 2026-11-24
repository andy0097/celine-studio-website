import type { Locale } from "@/design-system/types";
import { ROUTES } from "@/i18n/links";
import type { SketchImageData } from "@/components/ui/SketchImage";
import type { HeroSlide } from "@/components/hero/Hero";
import type { CustomElement } from "@/components/custom-elements/CustomElements";
import type { CategoryProject } from "@/components/categories/Categories";
import type { HomeTestimonial } from "@/components/testimonials/Testimonials";
import type { FooterContent } from "@/components/footer/Footer";

/**
 * What the component library needs beyond the `samples` in the *.meta.ts
 * files: the site's own images (public/images) and the few list items the
 * larger home sections need to look like themselves. Texts follow the
 * content seed (src/sanity/seed). When a sample in *.meta.ts grows to
 * cover something, use it in demos.tsx and drop it here.
 */

const L = <T>(ro: T, en: T) => ({ ro, en });
type ByLocale<T> = Record<Locale, T>;

export const CONTACT_EMAIL = "hello@celinestudio.ro";

const img = (src: string, alt: ByLocale<string>, sketch?: string) => (l: Locale): SketchImageData => ({ src, alt: alt[l], sketch });

export const IMAGES = {
  bathroom: img(
    "/images/projects/residential/bathroom.png",
    L("Baie cu oglindă rotundă iluminată", "Bathroom with a round backlit mirror"),
    "/images/projects/residential/bathroom_sketch.png",
  ),
  living: img("/images/hero/living-room.png", L("Living luminos și deschis", "Light, open living room"), "/images/hero/living-room_sketch.png"),
  dining: img("/images/projects/dining.png", L("Zonă de luat masa", "Dining area")),
  kitchen: img("/images/projects/kitchen.png", L("Bucătărie", "Kitchen")),
};

const ELEMENTS = [
  { key: "lighting", title: L("Iluminat", "Lighting"), src: "/images/custom-elements/lighting.png" },
  { key: "kitchen-joinery", title: L("Mobilier de bucătărie", "Kitchen joinery"), src: "/images/custom-elements/kitchen-joinery.png" },
  { key: "staircase", title: L("Scară", "Staircase"), src: "/images/custom-elements/staircase.png" },
];

const SLIDES = [
  { key: "living", image: IMAGES.living, panel: "/images/projects/living-room_panel.png", location: "Oradea" },
  { key: "kitchen", image: IMAGES.kitchen, panel: "/images/projects/kitchen_panel.png", title: L("Bucătărie cu insulă", "Kitchen with an island"), location: "Oradea" },
  { key: "dining", image: IMAGES.dining, panel: "/images/projects/dining_panel.png", title: L("Loc de luat masa", "Dining corner"), location: "Cluj" },
];

const QUOTES = [
  {
    key: "ana",
    quote: L(
      "Ne doream o cameră liniștită în care să poată trăi toată familia. Celine ne-a explicat fiecare pas, iar rezultatul pare să fi fost dintotdeauna al nostru.",
      "We wanted a calm room the whole family could live in. Celine walked us through every step, and the result feels like it was always ours.",
    ),
    client: { name: "Ana Mureșan", initials: "AM" },
    project: L("Proprietară | Rezidențial — Living, Oradea", "Homeowner | Residential — Living room, Oradea"),
    image: IMAGES.living,
  },
  {
    key: "mihai",
    quote: L(
      "Oaspeții noștri observă mai întâi lumina. Corpul de iluminat unicat a devenit semnătura cafenelei, iar tot proiectul s-a încadrat în termen.",
      "Our guests notice the light first. The custom fixture became the signature of our café, and the whole project ran on schedule.",
    ),
    client: { name: "Mihai Pop", initials: "MP" },
    project: L("Proprietar de cafenea | HORECA — Street Coffee, Oradea", "Café owner | HORECA — Street Coffee, Oradea"),
    image: IMAGES.dining,
  },
];

export const FILL = {
  /** Hero / ProjectsOverlay slides; the first takes the ProjectsOverlay sample's title. */
  slides: (l: Locale, firstTitle: string): HeroSlide[] =>
    SLIDES.map((x, i) => ({
      key: x.key,
      number: String(i + 1).padStart(2, "0"),
      title: i === 0 ? firstTitle : (x.title?.[l] ?? ""),
      location: x.location,
      photo: x.image(l),
      panel: x.panel,
      href: null,
    })),

  customElements: (l: Locale): CustomElement[] =>
    ELEMENTS.map((x, i) => ({
      key: x.key,
      number: String(i + 1).padStart(2, "0"),
      title: x.title[l],
      image: { src: x.src, alt: x.title[l] },
    })),

  categoryProjects: (l: Locale, category: "residential" | "horeca"): CategoryProject[] =>
    (category === "residential" ? [IMAGES.living, IMAGES.bathroom, IMAGES.kitchen] : [IMAGES.dining]).map((image, i) => {
      const data = image(l);
      return {
        key: `${category}-${i}`,
        title: data.alt,
        href: category === "residential" ? ROUTES.residential : ROUTES.horeca,
        image: { src: data.src, alt: data.alt },
        sketch: data.sketch ?? null,
      };
    }),

  processTitle: L("Procesul nostru", "Our process"),
  processParagraphs: L(
    [
      "La Celine Studio, abordarea noastră face drumul de la concept la final cât mai simplu și mai plăcut cu putință.",
      "Prin procesul nostru în patru etape punem pe primul loc claritatea, colaborarea și viziunea ta.",
    ],
    [
      "Our approach at Celine Studio is designed to make your journey from concept to completion as smooth and enjoyable as possible.",
      "With our four-stage process, we prioritise clarity, collaboration and your unique vision.",
    ],
  ),

  testimonials: (l: Locale): HomeTestimonial[] =>
    QUOTES.map((q) => ({ key: q.key, quote: q.quote[l], client: q.client, project: q.project[l], image: q.image(l) })),

  footer: (l: Locale, newsletterTitle: string): FooterContent => ({
    contact: { email: CONTACT_EMAIL, phone: "+40 745 123 456", address: L("Str. Republicii 12, Oradea", "Str. Republicii 12, Oradea")[l] },
    projects: [
      { key: "apartment", title: L("Apartament, Oradea", "Apartment, Oradea")[l], tag: "res", href: ROUTES.residential },
      { key: "street-coffee", title: "Street Coffee", tag: "horeca", href: ROUTES.horeca },
    ],
    newsletterTitle,
    newsletterText: L("Proiecte noi și note din studio, de câteva ori pe an.", "New projects and studio notes, a few times a year.")[l],
    tagline: L("Interioare rezidențiale și HORECA — Oradea, România", "Residential & HORECA interiors — Oradea, Romania")[l],
    legal: [
      { label: L("Politica de confidențialitate", "Privacy policy")[l], href: ROUTES.privacy },
      { label: "Instagram", external: "https://www.instagram.com/" },
    ],
  }),
};
