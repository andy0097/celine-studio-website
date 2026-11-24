# Celine Studio — Design system foundations

Tokens, dotted lines and images

This is a working reference for developing the Celine Studio site. The values come from the **Home** artboard in the Paper file *Celine Studio* (page "Design") and from the dotted-lines and images notes on the design-system whiteboard. It is the first layer of the bigger, agent-ready design system: tokens → sections → content model → voice → agent instructions → guardrails.

> Rule for everything below: use the token name, never the raw value. If a value is missing, add a token here first.

> **Where the tokens live (Nov 24, 2026):** the values below are kept in `design-system/tokens.json`, the single source. `npm run tokens` (also run before `dev` and `build`) generates `src/app/tokens.css`: the Tailwind theme, the `:root` layout/line/frame values with their desktop overrides, and one `type-*` class per type style. Change a value in tokens.json, never in the CSS. The file uses the Claude Design "Design System" token format, so the same file feeds the style guide and the design-system sync.

---

## 1. Tokens

### Colors

| Token | Value | Use |
|---|---|---|
| `color-surface` | `#F5EFE9` | Page background (cream). The default for every section. |
| `color-surface-alt` | `#D7D0CA` | Secondary surface (stone): alternating sections and FIG. label backgrounds. |
| `color-ink` | `#191618` | All text and icons, underlines, the primary button fill, the avatar fill. |
| `color-ink-muted` | `#191618` @ 70% (`#191618B3`) | Secondary text: footer column labels, the address, meta. |
| `color-ink-subtle` | `#191618` @ 50% (`#19161880`) | Placeholders (newsletter input). |
| `color-on-dark` | `#D7D0CA` | Text on photos and dark overlays; text inside ink avatars. |
| `color-on-dark-muted` | `#D7D0CA` @ 42% (`#D7D0CA6B`) | Inactive items in lists over photos. |
| `color-line` | `#000000` @ 48% (`#0000007A`) | Dotted lines on light surfaces. |
| `color-line-on-dark` | `rgb(219 215 214 / 48%)` | Dotted lines over photos and dark sections. |
| `color-line-on-photo` | `#FFFFFF` (frames: `#FFFFFF` @ 80%) | Dotted lines drawn inside an image. |
| `overlay-photo` | `linear-gradient(90deg, #19161862 0%, #1916184D 55%, #19161861 100%)` | A full-bleed photo with text on top (hero scroll state). |

Notes:
- The footer wordmark uses `#000000` at 64% opacity. Switch it to `color-ink` so the site has a single dark.
- Lines use `#000` while text uses `#191618`. That's fine to keep, but decide once and name it (`color-line`).

### Typography

There are two families:
- **Display:** Rizoma Light (300), for big headlines. ⚠️ The file uses *Rizoma Test L*, the trial version, so the licence must be bought before launch.
- **Text / UI:** Instrument Sans Medium (500). Regular (400) is used only for placeholders and the address. Almost everything is set in uppercase.

| Token | Font | Size / line-height (px) | Tracking | Case | Where |
|---|---|---|---|---|---|
| `type-wordmark` | Rizoma 300 | 500 / 400 | -0.04em | As written | Footer "Celine" |
| `type-display` | Rizoma 300 | 164 / 150 (one-line headings: 164 / 112) | -0.03em | Upper (hero), as written (sections) | Hero and section titles: Our process, Residential, HORECA, Kind words… |
| `type-lead` | Instrument Sans 500 | 24 / 28 | 0.12em | Upper | Hero tagline, project list rows |
| `type-body` | Instrument Sans 500 | 16 / 24 | 0.06em | Upper | Paragraphs, testimonial quotes |
| `type-link` | Instrument Sans 500 | 14 / 18 (lists: 14 / 20) | 0.06em | Upper | Text links, buttons, footer links, names |
| `type-label` | Instrument Sans 500 | 12 / 16 (multi-line captions: 12 / 18) | 0.14em | Upper | Nav, captions, meta, numbers (01), tags (RES / HORECA) |
| `type-fig` | Instrument Sans 500 | 11 / 18 | 0.14em | Upper | FIG. 01 labels on dimension lines |

Inconsistencies to settle:
- The hero tagline (24px) has 0 tracking and a 27px line-height, while the project list uses 0.12em / 28px. Pick one `type-lead`.
- The 164px display size needs a fluid scale for tablet and mobile, for example `clamp(64px, 11.4vw, 164px)`. Define it before building the mobile designs.

### Inner-page tokens (added with the inner pages, Nov 2026)

| Token | Font | Size / line-height (px) | Tracking | Where |
|---|---|---|---|---|
| `type-heading` | Rizoma 300 | 112 / 104 (fluid from 56) | -0.03em | Section titles on inner pages |
| `type-heading-sm` | Rizoma 300 | 88 / 84 (fluid from 48) | -0.03em | Two-column section titles, the closing CTA |
| `type-quote` | Rizoma 300 | 64 / 68 (fluid from 36) | -0.02em | Display testimonials, "Next project" |
| `type-prose` | Instrument Sans 400 | 16 / 26 | 0.01em, sentence case | Long legal text only |
| `type-nav-logo` | Rizoma 300 | 2 lines, 30px total | -0.03em | The wordmark in the navbar |

- `--header-h` (100px): room above the first content of an inner page, for the fixed header.
- The closing CTA on every inner page is the Residential "perspective room" (`CtaConversation`).
- Motion on inner pages is declared with data attributes and run by `PageMotion` (see the comment in that file).

### Spacing and layout

**Grid:**
- Content sits on a **12-column grid**, **1240px max width**, centred. Gutter **24px** on desktop, 16px on mobile. Minimum page margin (edge to content) is **100px** on desktop and 44px on mobile, so at 1440px the content is exactly 1240px.
- Two vertical page guides (dotted) sit **24px outside the content edges** (76px in from the page edge at 1440). They frame every section and follow the content on wider screens.
- Full-screen elements (full-bleed photos, overlays, section top borders) are the exception: they span the viewport and ignore the grid.
- In code: `container-page` for the centred content box, `grid-12` + `col-span-*` / `col-start-*` for placement; `--content-inset` / `--page-guide` for absolutely positioned elements inside a full-width section.
- Each section has one horizontal dotted line **16px** below its top edge (its top border).

**Spacing scale.** Most values in the design already sit on it:

| Token | px | Typical use |
|---|---|---|
| `space-2xs` | 4 | Inset of small framed images, icon nudges |
| `space-xs` | 8 | Link underline offset (padding-bottom) |
| `space-sm` | 12 | Text ↔ icon in links, list items, **the minimum distance from any dotted line** |
| `space-md` | 16 | Image ↔ caption, nav items, list row padding |
| `space-lg` | 24 | Paragraph groups, footer column blocks, inset from the page guides |
| `space-xl` | 32 | Footer contact ↔ CTA, footer link groups |
| `space-2xl` | 48 | Section inner top spacing (compact sections) |
| `space-3xl` | 64 | Gap between footer columns |
| `space-4xl` | 96 | Bottom spacing of hero and feature content |
| `space-5xl` | 112 | Large section padding |

Values in the file that are off the scale, and what to round them to:
- 10 → 12 (custom element captions)
- 14 → 16 (project card captions, testimonial name gap)
- 20 → 24 (hero tagline ↔ CTA, testimonial stack)
- 104 → 112 (footer top padding)

**Other tokens:**
- **Radius:** `radius-none` (0) everywhere. `radius-full` is used only for avatars.
- **Strokes:** `stroke-hairline` is 1px (lines, underlines). Icons use 1.2px.
- **Primary button:** `color-ink` fill and `color-surface` text, padding 16 / 22, gap 14, 14px arrow icon.
- **Text link:** `type-link` with a 1px solid `color-ink` underline 8px below the text, and a 12px gap to the ↗ arrow.

---

## 2. Dotted lines

The dotted lines are the signature of the site: they make the page read like an architect's drawing. Treat them as a system, not decoration.

### Base spec
- 1px stroke, dash **4 / gap 4**.
- The colour depends on the surface: `color-line` on cream or stone, `color-line-on-dark` over dark photos, `color-line-on-photo` inside an image.
- Lines are drawn on a separate layer behind the content and never carry content themselves.

### The four kinds of lines

1. **Page guides.** Two vertical lines, 100px in from each side of the page, running the whole length of the site.
   - They should feel like they **move with the screen rather than staying static** while you scroll, especially the vertical ones along the whole website. For example: a fixed layer, or a dash offset tied to scroll.
2. **Section borders.** Every section sits between dotted lines.
   - **Never double a line.** Each section has a *top* border only, and the next section's top border closes the previous one.
3. **Image / card frames (crop marks).** Dotted lines that run past an image like crop marks on a drawing.
   - The verticals follow the image's left and right edges, from 56px above the image to 12px below it.
   - The horizontals follow the top and bottom edges. They reach the page guide on the outer side and extend 56px past the image on the inner side.
   - 28px above the image sits a **dimension line**: solid 1px `color-ink`, as wide as the image, with a 10px 45° tick at each end. An optional FIG. 0X label (`type-fig` on a `color-surface-alt` chip) sits centred on it.
   - **Draw-on effect:** the frame lines appear as if someone is drawing them live, triggered when the image enters the viewport. Run it once per element. With `prefers-reduced-motion`, show the lines immediately.
4. **Inset frames and dividers.**
   - A dashed 1px border around a detail image, with 10px padding (4px for small insets).
   - Dashed row dividers in lists: the active row at 50% opacity, the others at 20%.

### Rules
- Keep at least **12px** between a dotted line and any element, horizontally or vertically.
- Lines align to the grid: page guides, content edges, image edges. Never draw a free-floating line.
- Use one line weight and one dash pattern across the whole site.
- On mobile, keep the page guides (moved in to 16–20px from the edge) and the section borders, and reduce image frames to the vertical crop marks.

---

## 3. Images

### What the images are

| Type | What it shows | Ratio / size in the design | Where |
|---|---|---|---|
| Hero portrait | The best finished interior, vertical | ~2:3 (522 × 809) | Home hero |
| Full-bleed scene | A wide interior with room for text; gets `overlay-photo` | 1440 × 1024 (≈ 7:5); the process strip ≈ 2.2:1 | Hero scroll state, process section |
| Project cover | One finished room per project | ~3:2 (304 × 210) | Project cards, project grid |
| Detail / custom element | A close-up of something the studio designed: lighting, joinery, a staircase | 3:4 (320 × 420) | "Custom elements" section |
| Testimonial image | The client's finished space | 4:5 (440 × 550) | Testimonials |
| Inset detail | A material or detail crop inside a larger image or frame | ~5:6 (380 × 460); small ~4:5 | Project list, project cards |
| Sketch | A hand sketch or drawing of the same view as a photo | Same ratio and crop as its photo | Hover state |

### Hover: photo → sketch
- Hovering over a photo turns it into the **sketch** of the same view (crossfade or wipe).
- This only works if every photo with a hover has a **paired sketch** with the same ratio, framing and vanishing point. Store the sketch as a field on the image, not as a separate image.
- No sketch → no hover effect; the image stays static. Never fake it with a filter.
- Touch devices have no hover, so show the sketches in the project page gallery instead.

### Photo standards
- Professional photography only, no phone shots. Warm natural light and consistent white balance; the cream and stone palette depends on it.
- Straight verticals (architectural correction), with the camera at eye level or slightly lower.
- Real projects only. Label every image with its type (Residential / HORECA) and location.
- Export as AVIF or WebP, at least 2× the displayed size (full-bleed ≥ 2880px wide, cards ≥ 1200px).
- Every image gets alt text: room + project + what's notable (e.g. "Kitchen with walnut joinery, mid-century remodel, Oradea").
- File names: `project-slug_room_01.jpg` and `project-slug_room_01_sketch.jpg`.

### What each project needs (for the content model)
- 1 cover (3:2) + 1 portrait (4:5)
- 3–8 gallery images, landscape or portrait, in the ratios above
- 1–3 detail shots (3:4) if the project has custom elements
- A sketch for each image that should get the hover effect

---

## Open decisions
- Buy the licence for Rizoma (the file uses the Test version).
- Define the fluid type scale and the mobile line positions (part of the mobile designs task).
- Choose the stack (Webflow vs Sanity-backed). It decides how these tokens and image fields are enforced.
