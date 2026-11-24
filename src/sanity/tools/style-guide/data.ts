/**
 * Everything the Style guide shows. Tokens come straight from
 * design-system/tokens.json (the single source); the written guidelines
 * mirror Resources/design-system-foundations.md and PageMotion.tsx. Nothing
 * here is editable in /admin: change the repo, and the guide follows.
 */
import tokens from "../../../../design-system/tokens.json";

export type Token = { name: string; value: string; usage: string; lg?: string; cssValue?: string };
export type TypeStyle = {
  name: string;
  fontSize: string;
  fluid?: string;
  lineHeight: number | string;
  letterSpacing: string;
  fontWeight: number;
  transform?: string;
  sample: string;
  usage: string;
};
export type TypeGroup = { name: string; family: string; styles: TypeStyle[] };

export const TOKENS_VERSION = tokens.version;
export const COLORS: Token[] = tokens.color.tokens;
export const TYPE_GROUPS = tokens.type.groups as TypeGroup[];
export const FAMILIES = tokens.type.families as Record<string, string>;
export const SPACING: Token[] = tokens.spacing.tokens;
export const RADIUS: Token[] = tokens.radius.tokens;
export const LAYOUT: Token[] = tokens.layout.tokens;
export const LAYOUT_NOTE = tokens.layout.note;
export const LINES: Token[] = tokens.line.tokens;
export const LINE_NOTE = tokens.line.note;
export const FRAMES: Token[] = tokens.frame.tokens;
export const FRAME_NOTE = tokens.frame.note;
export const OVERLAYS: Token[] = tokens.overlay.tokens;
export const TOKEN_RULE = tokens.meta.rules;

export function token(list: Token[], name: string) {
  const found = list.find((t) => t.name === name);
  if (!found) throw new Error(`Unknown token ${name}`);
  return found.cssValue ?? found.value;
}

/** Colour tokens as values, for the specimens. */
export const C = Object.fromEntries(COLORS.map((t) => [t.name, t.cssValue ?? t.value])) as Record<string, string>;

/* ----------------------------------------------------------------- Fonts */

export type BrandFont = {
  family: string;
  role: string;
  weights: string;
  stack: string;
  /** A font file in public/, for @font-face and the download. */
  file?: string;
  /** Where the font comes from when it is not a file in the repo. */
  source?: { label: string; href: string };
  licence: string;
  /** May the file be handed to third parties? */
  shareable: boolean;
  sample: string;
};

const rizoma = tokens.type.fonts[0];

export const FONTS: BrandFont[] = [
  {
    family: "Rizoma",
    role: "Display: wordmark, page and section titles, quotes.",
    weights: `Light ${rizoma.weight}`,
    stack: FAMILIES.display,
    file: `/${rizoma.file}`,
    licence:
      "Trial (Rizoma Test L, by Rui Abreu). Fine for design work inside the studio; the licence must be bought before launch and before the file goes to anyone else (plan 0.6 / 7.1). The trial has no Romanian ă â î ș ț.",
    shareable: false,
    sample: "Celine Studio",
  },
  {
    family: "Instrument Sans",
    role: "Text and UI: body, links, labels, captions. Almost always uppercase.",
    weights: "Medium 500 (Regular 400 for prose and placeholders)",
    stack: FAMILIES.sans,
    source: { label: "Google Fonts", href: "https://fonts.google.com/specimen/Instrument+Sans" },
    licence: "SIL Open Font License: free to use and share.",
    shareable: true,
    sample: "Residential & HORECA interior design",
  },
];

/** Rizoma from the repo, Instrument Sans from Google Fonts (the site loads it with next/font). */
export const FONT_CSS = `@font-face{font-family:"Rizoma";src:url("/${rizoma.file}") format("opentype");font-weight:${rizoma.weight};font-style:${rizoma.style};font-display:swap}`;
export const INSTRUMENT_SANS_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500&display=swap";

/* ---------------------------------------------------------- Guidelines */

export const COLOR_RULES = [
  "One dark (color-ink) for all text, icons, underlines and the primary button. No pure black text.",
  "Cream (color-surface) is the default background; stone (color-surface-alt) alternates sections and carries FIG. labels and tags.",
  "Over photos and dark bands, text switches to color-on-dark and lines to color-line-on-dark.",
  "Muted and subtle inks are the same dark at 70% and 50%, never a new grey.",
];

export const TYPE_RULES = [
  "Two families only: Rizoma Light for display, Instrument Sans for everything else.",
  "Text styles are uppercase with open tracking; display styles are written as is, with tight negative tracking.",
  "Display sizes are fluid (the clamp() shown on each style); text sizes are fixed.",
  "Sentence-case prose (type-prose) is only for long legal text.",
];

export const LINE_KINDS = [
  { title: "Page guides", text: "Two vertical lines 24px outside the content edges, running the whole page. They move with the screen as you scroll." },
  { title: "Section borders", text: "Each section has one top border, 16px below its top edge. The next section's border closes the previous one: never double a line." },
  { title: "Crop marks", text: "Dotted lines that run past an image like marks on a drawing: verticals from 56px above to 12px below; horizontals out to the page guide and 56px past the inner side." },
  { title: "Dimension line", text: "28px above a framed image: solid 1px ink, as wide as the image, with a 10px 45° tick at each end and an optional FIG. 0X chip in the middle." },
  { title: "Inset frames and dividers", text: "A dashed border 10px around a detail image (4px for small insets). Dashed list dividers: the active row at 50%, the others at 20%." },
];

export const LINE_RULES = [
  "1px, dash 4 / gap 4, everywhere. One weight, one pattern.",
  "Keep at least 12px between a dotted line and anything else.",
  "Lines align to the grid (page guides, content edges, image edges). Never a free-floating line.",
  "Lines sit on their own layer behind the content and never carry content.",
  "On mobile: page guides move in to 16–20px, section borders stay, image frames keep only the vertical crop marks.",
];

/** GSAP eases used on the site, with their CSS equivalents for the demos. */
export const EASES = [
  { name: "power3.out", css: "cubic-bezier(0.215, 0.61, 0.355, 1)", use: "Things arriving: lines of a headline, fades, image scale settling." },
  { name: "power2.inOut", css: "cubic-bezier(0.455, 0.03, 0.515, 0.955)", use: "Things drawn or wiped: dotted lines, dimension lines, image wipes." },
  { name: "power2.out", css: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", use: "Scrubbed reveals that follow the scroll." },
  { name: "none (linear)", css: "linear", use: "Parallax only." },
];

export type Motion = { attr: string; name: string; what: string; timing: string; demo: "rise" | "draw-x" | "draw-y" | "fade" | "wipe" | "frame" | "parallax" | "stagger" };

export const MOTIONS: Motion[] = [
  { attr: "data-guide", name: "Guides draw on", what: "Page guides and the top line draw on when the page opens.", timing: "1.4s · power3.inOut · 0.12s stagger", demo: "draw-y" },
  { attr: "data-intro-lines / data-lines", name: "Headline rises", what: "A display headline rises line by line from behind masks.", timing: "1.2s · power3.out · 0.12s per line (scrubbed on scroll)", demo: "rise" },
  { attr: "data-intro-media / data-wipe", name: "Image wipe", what: "An image is wiped in from its bottom edge while it settles from 108% to 100%.", timing: "1.5s wipe · 1.8s scale · power2.inOut / power3.out", demo: "wipe" },
  { attr: "data-intro-item / data-fade", name: "Fade up", what: "Fades in from 16–24px below, once, in document order.", timing: "0.9s · power3.out · 0.08s stagger", demo: "fade" },
  { attr: "data-stagger", name: "Stagger", what: "Children fade up one after another.", timing: "0.9s · power3.out · 0.1s stagger", demo: "stagger" },
  { attr: "data-line-x / data-line-y", name: "Dotted line draws", what: "A dotted line draws itself as it scrolls into view.", timing: "scrubbed · power2.inOut", demo: "draw-x" },
  { attr: "data-frame", name: "Frame draws itself", what: "Crop marks, then the image, the dimension line, ticks, FIG. and finally the caption.", timing: "scrubbed · lines 0.5 · image 0.7 · text last", demo: "frame" },
  { attr: "data-parallax", name: "Parallax", what: "A full-bleed image drifts ±6% against the scroll, at 114% scale.", timing: "scrubbed · linear", demo: "parallax" },
];

export const MOTION_RULES = [
  "Use PageMotion's data attributes; never write one-off GSAP in a component.",
  "Motion explains how the page is drawn: lines draw, images wipe in, text rises. Nothing bounces or spins.",
  "Each element animates once on the way in.",
  "With prefers-reduced-motion everything is shown in its final state.",
  "Over dark bands (data-tone=\"dark\") the header turns light in 0.4s.",
];

export const LOGO_RULES = [
  "The logos are Rizoma Light set with the type styles: type-wordmark for \"Celine\", type-nav-logo for CELINE / STUDIO. Never redraw or retype them.",
  "Ink (color-ink) on cream or stone; color-on-dark on photos and dark backgrounds. No other colours, no effects.",
  "The navbar logo is 30px tall on the site. Keep at least that size on screen.",
  "Give it room: at least the height of one line of the logo clear on every side.",
  "Don't stretch, outline, rotate or put it in a box.",
];

export const IMAGE_TYPES = [
  { type: "Hero portrait", shows: "The best finished interior, vertical", ratio: "~2:3", where: "Home hero" },
  { type: "Full-bleed scene", shows: "A wide interior with room for text; gets overlay-photo", ratio: "≈ 7:5 (process strip ≈ 2.2:1)", where: "Hero scroll state, process" },
  { type: "Project cover", shows: "One finished room per project", ratio: "~3:2", where: "Project cards and grid" },
  { type: "Detail / custom element", shows: "A close-up of something the studio designed", ratio: "3:4", where: "Custom elements" },
  { type: "Testimonial image", shows: "The client's finished space", ratio: "4:5", where: "Testimonials" },
  { type: "Inset detail", shows: "A material or detail crop inside a larger frame", ratio: "~5:6 (small ~4:5)", where: "Project list, cards" },
  { type: "Sketch", shows: "A hand sketch of the same view as a photo", ratio: "Same ratio and crop as its photo", where: "Hover state" },
];

export const IMAGE_RULES = [
  "Professional photography only, no phone shots. Warm natural light and consistent white balance: the cream and stone palette depends on it.",
  "Straight verticals (architectural correction), camera at eye level or slightly lower.",
  "Real projects only, each labelled Residential or HORECA and with its location.",
  "Export AVIF or WebP at least 2× the displayed size (full-bleed ≥ 2880px wide, cards ≥ 1200px).",
  "Alt text in both languages: room + project + what's notable, e.g. \"Kitchen with walnut joinery, mid-century remodel, Oradea\".",
  "File names: project-slug_room_01.jpg and project-slug_room_01_sketch.jpg.",
];

export const SKETCH_RULES = [
  "Hovering a photo turns it into the sketch of the same view.",
  "Only with a paired sketch of the same ratio, framing and vanishing point, stored on the image (Images › sketch).",
  "No sketch, no hover: the image stays still. Never fake it with a filter.",
  "Touch screens have no hover, so the project gallery shows the sketches instead.",
];

export const PROJECT_NEEDS = [
  "1 cover (3:2) and 1 portrait (4:5)",
  "3–8 gallery images in the ratios above",
  "1–3 detail shots (3:4) if the project has custom elements",
  "A sketch for each image that should get the hover",
];

/** A photo and its sketch from public/, for the hover demo. */
export const SKETCH_PAIR = {
  photo: "/images/hero/living-room.png",
  sketch: "/images/hero/living-room_sketch.png",
  alt: "Living room with a woven pendant light, low sectional sofa and round coffee tables",
};

/**
 * Voice: drawn from the site's own copy (Sanity seed and messages/). Draft
 * until Celine confirms it; the examples are live texts from the site.
 */
export const VOICE_PRINCIPLES = [
  { title: "Plain and concrete", text: "Say what is done and what the client gets: measurements, routes, drawings, budget. No adjectives doing the work of facts." },
  { title: "Calm and certain", text: "Short declarative sentences. The studio explains; it doesn't sell or shout. No exclamation marks." },
  { title: "Built around how people live and work", text: "Homes are described by daily life (light, storage, the hours of the day); venues by service (seats, queues, peak hours)." },
  { title: "No surprises", text: "Promise clarity: each stage says what you receive and what you decide before the next one starts." },
];

export const VOICE_EXAMPLES = [
  "Six stages. You see what you get at each one before you sign.",
  "Furniture drawn to the room’s dimensions — no gaps, no dead corners.",
  "A venue isn’t judged only by how it looks, but by how it works on a full day.",
  "Measurements, guest and staff routes, capacity and budget — agreed before any sketch.",
];

export const VOICE_RULES = [
  "Romanian is the default language; every text exists in RO and EN. Use ă â î ș ț (comma below), never ş ţ.",
  "Write \"we\" for the studio and \"you\" for the client.",
  "UI labels are short and literal: \"Book a consultation\", \"Next project\", \"See all Residential projects\".",
  "Category names stay as they are: Residential / Rezidențial and HORECA (always uppercase).",
  "Figures and stages are numbered with two digits: \"FIG. 01\", \"01\".",
];
export const VOICE_DONT = ["Luxury clichés (\"stunning\", \"dream home\", \"bespoke luxury\")", "Exclamation marks and emoji", "Promises the studio can't measure"];
