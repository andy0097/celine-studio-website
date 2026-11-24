"use client";

/**
 * The style guide as a brand book for third parties, printed to PDF from the
 * Studio (exportPdf). A4, in the brand's own look; same data as the tool.
 */
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import type { ReactNode } from "react";
import {
  COLOR_RULES,
  COLORS,
  FONTS,
  FONT_CSS,
  FRAMES,
  IMAGE_RULES,
  IMAGE_TYPES,
  INSTRUMENT_SANS_CSS_URL,
  LAYOUT,
  LINE_KINDS,
  LINE_RULES,
  LINES,
  LOGO_RULES,
  MOTION_RULES,
  MOTIONS,
  PROJECT_NEEDS,
  RADIUS,
  SKETCH_PAIR,
  SKETCH_RULES,
  SPACING,
  TOKENS_VERSION,
  TYPE_GROUPS,
  TYPE_RULES,
  VOICE_DONT,
  VOICE_EXAMPLES,
  VOICE_PRINCIPLES,
  VOICE_RULES,
  type Token,
} from "./data";
import { Dotted, FrameDemo, INK, label, Logo, ON_DARK, SURFACE, SURFACE_ALT, Swatch, typeCss } from "./specimens";

const display = { fontFamily: '"Rizoma", "Instrument Sans", sans-serif', fontWeight: 300, letterSpacing: "-0.03em", color: INK, margin: 0 } as const;
const body = { fontFamily: '"Instrument Sans", sans-serif', fontSize: 10, lineHeight: 1.5, letterSpacing: "0.01em", color: INK, margin: 0 } as const;
const muted = { ...body, opacity: 0.7 } as const;

function Page({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="page">
      <Dotted length="100%" style={{ marginBottom: 14 }} />
      <p style={{ ...label, fontSize: 9, marginBottom: 6 }}>{n}</p>
      <h2 style={{ ...display, fontSize: 44, lineHeight: 0.95, marginBottom: 20 }}>{title}</h2>
      {children}
    </section>
  );
}

function Rules({ items }: { items: string[] }) {
  return (
    <ul style={{ ...body, paddingLeft: 14, margin: "12px 0 0", display: "grid", gap: 4 }}>
      {items.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  );
}

function TokenTable({ tokens }: { tokens: Token[] }) {
  return (
    <table style={{ ...body, width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
      <tbody>
        {tokens.map((t) => (
          <tr key={t.name} style={{ borderTop: `1px dashed ${SURFACE_ALT}` }}>
            <td style={{ padding: "4px 8px 4px 0", fontFamily: "ui-monospace, monospace", fontSize: 9, whiteSpace: "nowrap" }}>{t.name}</td>
            <td style={{ padding: "4px 8px 4px 0", fontFamily: "ui-monospace, monospace", fontSize: 9, whiteSpace: "nowrap" }}>
              {t.value}
              {t.lg ? ` → ${t.lg} (lg)` : ""}
            </td>
            <td style={{ padding: "4px 0" }}>{t.usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PrintGuide({ date }: { date: string }) {
  return (
    <main>
      {/* Cover */}
      <section className="page cover">
        <Logo logo="stacked" height={60} />
        <div>
          <h1 style={{ ...display, fontSize: 96, lineHeight: 0.92 }}>Brand guidelines</h1>
          <p style={{ ...label, marginTop: 24 }}>Celine Studio · Interior design · Oradea</p>
          <p style={{ ...label, marginTop: 6, opacity: 0.7 }}>
            Tokens v{TOKENS_VERSION} · {date}
          </p>
        </div>
        <p style={muted}>Generated from the website&apos;s design system. Use token names, never raw values; changes are made in the repository, not in this document.</p>
      </section>

      <Page n="01" title="Logos">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {(["stacked", "wordmark"] as const).flatMap((logo) => [
            <div key={logo + "l"} style={{ background: SURFACE_ALT, height: 150, display: "grid", placeItems: "center" }}>
              <Logo logo={logo} height={logo === "stacked" ? 70 : 60} />
            </div>,
            <div key={logo + "d"} style={{ background: INK, height: 150, display: "grid", placeItems: "center" }}>
              <Logo logo={logo} height={logo === "stacked" ? 70 : 60} color={ON_DARK} />
            </div>,
          ])}
        </div>
        <Rules items={LOGO_RULES} />
      </Page>

      <Page n="02" title="Colour">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {COLORS.map((c) => (
            <div key={c.name}>
              <Swatch color={c} height={56} />
              <p style={{ ...body, fontSize: 8, fontFamily: "ui-monospace, monospace", marginTop: 4 }}>{c.name}</p>
              <p style={{ ...muted, fontSize: 8 }}>{c.value}</p>
              <p style={{ ...muted, fontSize: 8 }}>{c.usage}</p>
            </div>
          ))}
        </div>
        <Rules items={COLOR_RULES} />
      </Page>

      <Page n="03" title="Typography">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {FONTS.map((font) => (
            <div key={font.family}>
              <p style={{ ...(font.family === "Rizoma" ? display : { ...body, fontWeight: 500 }), fontSize: 28, lineHeight: 1 }}>{font.family}</p>
              <p style={{ ...body, marginTop: 6 }}>{font.role}</p>
              <p style={muted}>{font.weights}</p>
              <p style={{ ...muted, fontSize: 8, marginTop: 4 }}>{font.licence}</p>
            </div>
          ))}
        </div>
        {TYPE_GROUPS.map((group) =>
          group.styles.map((s) => (
            <div key={s.name} style={{ borderTop: `1px dashed ${SURFACE_ALT}`, padding: "8px 0", display: "grid", gridTemplateColumns: "120px 1fr", gap: 12, alignItems: "baseline" }}>
              <div>
                <p style={{ ...body, fontSize: 8, fontFamily: "ui-monospace, monospace" }}>{s.name}</p>
                <p style={{ ...muted, fontSize: 8 }}>
                  {s.fontSize} / {String(s.lineHeight)} · {s.letterSpacing}
                </p>
              </div>
              <p style={{ ...typeCss(s, group.family, 40), paddingTop: "0.2em" }}>{s.sample}</p>
            </div>
          )),
        )}
        <Rules items={TYPE_RULES} />
      </Page>

      <Page n="04" title="Spacing and layout">
        {SPACING.map((t) => (
          <div key={t.name} style={{ display: "grid", gridTemplateColumns: "80px 40px 1fr", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span style={{ ...body, fontSize: 8, fontFamily: "ui-monospace, monospace" }}>{t.name}</span>
            <span style={muted}>{t.value}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: parseFloat(t.value), height: 8, background: INK, flex: "none" }} />
              <span style={{ ...muted, fontSize: 8 }}>{t.usage}</span>
            </div>
          </div>
        ))}
        <TokenTable tokens={[...LAYOUT, ...RADIUS]} />
      </Page>

      <Page n="05" title="Lines and frames">
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
          <FrameDemo src={SKETCH_PAIR.photo} width={150} height={190} caption="FIG. 01 — Living room" />
          <div style={{ display: "grid", gap: 8 }}>
            {LINE_KINDS.map((k) => (
              <div key={k.title}>
                <p style={{ ...label, fontSize: 9 }}>{k.title}</p>
                <p style={body}>{k.text}</p>
              </div>
            ))}
          </div>
        </div>
        <Rules items={LINE_RULES} />
        <TokenTable tokens={[...LINES, ...FRAMES]} />
      </Page>

      <Page n="06" title="Motion">
        {MOTIONS.map((m) => (
          <div key={m.name} style={{ borderTop: `1px dashed ${SURFACE_ALT}`, padding: "6px 0", display: "grid", gridTemplateColumns: "140px 1fr 170px", gap: 10 }}>
            <p style={{ ...label, fontSize: 9 }}>{m.name}</p>
            <p style={body}>{m.what}</p>
            <p style={{ ...muted, fontSize: 8 }}>{m.timing}</p>
          </div>
        ))}
        <Rules items={MOTION_RULES} />
      </Page>

      <Page n="07" title="Images">
        <table style={{ ...body, width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {IMAGE_TYPES.map((t) => (
              <tr key={t.type} style={{ borderTop: `1px dashed ${SURFACE_ALT}` }}>
                <td style={{ padding: "4px 8px 4px 0", fontWeight: 500 }}>{t.type}</td>
                <td style={{ padding: "4px 8px 4px 0" }}>{t.shows}</td>
                <td style={{ padding: "4px 8px 4px 0", whiteSpace: "nowrap" }}>{t.ratio}</td>
                <td style={{ padding: "4px 0" }}>{t.where}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          {[SKETCH_PAIR.photo, SKETCH_PAIR.sketch].map((src, i) => (
            <figure key={src} style={{ margin: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={{ width: "100%", height: 170, objectFit: "cover", display: "block" }} />
              <figcaption style={{ ...label, fontSize: 9, marginTop: 6 }}>{i ? "Its sketch: same ratio, framing and vanishing point" : "Photo"}</figcaption>
            </figure>
          ))}
        </div>
        <Rules items={[...SKETCH_RULES, ...IMAGE_RULES]} />
        <p style={{ ...label, fontSize: 9, marginTop: 12 }}>Each project needs</p>
        <Rules items={PROJECT_NEEDS} />
      </Page>

      <Page n="08" title="Voice">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {VOICE_PRINCIPLES.map((v) => (
            <div key={v.title}>
              <p style={{ ...label, fontSize: 9 }}>{v.title}</p>
              <p style={body}>{v.text}</p>
            </div>
          ))}
        </div>
        <div style={{ background: SURFACE_ALT, padding: 14, marginTop: 14, display: "grid", gap: 8 }}>
          {VOICE_EXAMPLES.map((e) => (
            <p key={e} style={{ ...display, fontSize: 18, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              “{e}”
            </p>
          ))}
        </div>
        <Rules items={VOICE_RULES} />
        <p style={{ ...label, fontSize: 9, marginTop: 12 }}>Avoid</p>
        <Rules items={VOICE_DONT} />
      </Page>
    </main>
  );
}

const PRINT_CSS = `
${FONT_CSS}
@page { size: A4; margin: 14mm; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; background: ${SURFACE}; }
.page { break-after: page; padding: 0; }
.page:last-child { break-after: auto; }
.cover { min-height: 265mm; display: flex; flex-direction: column; justify-content: space-between; }
tr, figure, .page > div { break-inside: avoid; }
`;

/**
 * Renders the brand book into a hidden frame and opens the print dialog,
 * where "Save as PDF" makes the file. Resolves once the dialog is open.
 */
export async function exportPdf() {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:210mm;height:297mm;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Celine Studio — Brand guidelines</title><link rel="stylesheet" href="${INSTRUMENT_SANS_CSS_URL}"><style>${PRINT_CSS}</style></head><body><div id="root"></div></body></html>`,
  );
  doc.close();

  const root = createRoot(doc.getElementById("root")!);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  flushSync(() => root.render(<PrintGuide date={date} />));

  // Wait for the font stylesheet, the fonts and the images, so the PDF isn't printed in fallbacks.
  const link = doc.querySelector<HTMLLinkElement>("link[rel=stylesheet]");
  if (link && !link.sheet) {
    await new Promise((r) => {
      link.addEventListener("load", r, { once: true });
      link.addEventListener("error", r, { once: true });
      setTimeout(r, 4000);
    });
  }
  await new Promise((r) => setTimeout(r, 50));
  await Promise.all([
    doc.fonts.ready,
    ...Array.from(doc.images).map((img) => (img.complete ? null : new Promise((r) => ((img.onload = r), (img.onerror = r))))),
  ]);

  const win = frame.contentWindow!;
  const cleanup = () => {
    root.unmount();
    frame.remove();
  };
  win.addEventListener("afterprint", () => setTimeout(cleanup, 100), { once: true });
  win.focus();
  win.print();
}
