/**
 * The instruction every model gets. It describes Celine Studio's sketch style
 * (plan 6.2: tune it on the studio's existing sketches). Framing must not
 * change: on the site the sketch is wiped over the photo on hover, so every
 * line has to sit exactly on top of the thing it draws.
 *
 * DRAWING_STYLE_PROMPT (env) replaces it without a code change while tuning.
 */
export const DEFAULT_PROMPT = [
  "Redraw this interior photograph as an architect's hand sketch.",
  "Keep the exact same framing, camera position, perspective and proportions: every edge must line up with the original photo when the two are laid on top of each other. Do not crop, zoom, rotate or add anything.",
  "Style: fine, confident black ink lines on a plain warm off-white paper background, like an interior designer's concept drawing. Clean contour lines for walls, furniture, joinery and light fittings; light hatching only for shadows and dark materials; no colour, no grey wash, no text, no signature, no frame.",
  "Simplify clutter and small decorative objects into a few lines, but keep the architecture and every piece of furniture recognisable.",
].join(" ");

export function stylePrompt(notes?: string) {
  const base = process.env.DRAWING_STYLE_PROMPT?.trim() || DEFAULT_PROMPT;
  const extra = notes?.trim();
  return extra ? `${base}\n\nAdditional instructions for this image: ${extra.slice(0, 500)}` : base;
}
