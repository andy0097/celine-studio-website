"use client";

/**
 * Brand specimens: the tokens drawn in the brand's own look. Plain React with
 * inline styles (no Sanity UI), so the same pieces render in the Studio tool
 * and in the PDF export.
 */
import { useState, type CSSProperties } from "react";
import {
  C,
  EASES,
  FAMILIES,
  FONT_CSS,
  FRAMES,
  INSTRUMENT_SANS_CSS_URL,
  LINES,
  SKETCH_PAIR,
  token,
  type Motion,
  type Token,
  type TypeStyle,
} from "./data";
import { LOGO_PATHS } from "./logos.generated";

export const INK = C["color-ink"];
export const SURFACE = C["color-surface"];
export const SURFACE_ALT = C["color-surface-alt"];
export const ON_DARK = C["color-on-dark"];

const px = (v: string) => parseFloat(v);
const DASH = px(token(LINES, "line-dash"));
const GAP = px(token(LINES, "line-gap"));

/** The fonts, loaded once wherever specimens render. */
export function BrandFonts() {
  return (
    <>
      <link rel="stylesheet" href={INSTRUMENT_SANS_CSS_URL} />
      <style>{FONT_CSS + MOTION_CSS}</style>
    </>
  );
}

/** A type style as inline CSS. `maxSize` caps display sizes so they fit a card. */
export function typeCss(style: TypeStyle, family: string, maxSize?: number): CSSProperties {
  const size = px(style.fontSize);
  const shown = maxSize ? Math.min(size, maxSize) : size;
  return {
    fontFamily: FAMILIES[family],
    fontSize: shown,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    fontWeight: style.fontWeight,
    textTransform: (style.transform as CSSProperties["textTransform"]) ?? "none",
    color: INK,
    margin: 0,
  };
}

export const label: CSSProperties = {
  fontFamily: FAMILIES.sans,
  fontSize: 12,
  lineHeight: "16px",
  letterSpacing: "0.14em",
  fontWeight: 500,
  textTransform: "uppercase",
};

/* ---------------------------------------------------------------- Colour */

/** Swatch on a cream/stone checker so translucent inks read honestly. */
export function Swatch({ color, height = 96 }: { color: Token; height?: number }) {
  const value = color.cssValue ?? color.value;
  const onPhoto = color.name.includes("on-photo") || color.name.includes("on-dark");
  return (
    <div
      style={{
        height,
        background: onPhoto ? INK : `repeating-linear-gradient(90deg, ${SURFACE} 0 50%, ${SURFACE_ALT} 50% 100%)`,
        position: "relative",
        border: `1px solid ${SURFACE_ALT}`,
      }}
    >
      <div style={{ position: "absolute", inset: onPhoto ? 16 : 0, background: value }} />
    </div>
  );
}

/* ------------------------------------------------------------------ Lines */

/** A dotted line with the site's exact dash (4 / 4, 1px). */
export function Dotted({ vertical, length, color = C["color-line"], style }: { vertical?: boolean; length: number | string; color?: string; style?: CSSProperties }) {
  const dir = vertical ? "180deg" : "90deg";
  return (
    <div
      aria-hidden
      style={{
        width: vertical ? 1 : length,
        height: vertical ? length : 1,
        background: `repeating-linear-gradient(${dir}, ${color} 0 ${DASH}px, transparent ${DASH}px ${DASH + GAP}px)`,
        ...style,
      }}
    />
  );
}

const f = (name: string) => px(token(FRAMES, name));

/**
 * An image framed like the site: crop marks overshooting the image,
 * a dimension line with 45° ticks and a FIG. chip, and a caption.
 */
export function FrameDemo({ src, width = 260, height = 320, fig = "FIG. 01", caption, animate }: { src: string; width?: number; height?: number; fig?: string; caption?: string; animate?: boolean }) {
  const top = f("frame-overshoot-top");
  const bottom = f("frame-overshoot-bottom");
  const inner = f("frame-overshoot-inner");
  const dim = f("dimension-line-offset");
  const tick = f("dimension-tick");
  const capGap = f("caption-gap");
  const a = (name: string, delay: number): CSSProperties => (animate ? { animation: `sg-${name} 0.9s cubic-bezier(0.455,0.03,0.515,0.955) ${delay}s both` } : {});
  return (
    <div style={{ position: "relative", width: width + inner * 2, paddingTop: top, paddingBottom: bottom + 40 }}>
      <div style={{ position: "relative", marginLeft: inner, width, height }}>
        {/* crop marks */}
        <Dotted vertical length={height + top + bottom} style={{ position: "absolute", left: 0, top: -top, transformOrigin: "top", ...a("draw-y", 0) }} />
        <Dotted vertical length={height + top + bottom} style={{ position: "absolute", right: 0, top: -top, transformOrigin: "top", ...a("draw-y", 0) }} />
        <Dotted length={width + inner * 2} style={{ position: "absolute", left: -inner, top: 0, transformOrigin: "left", ...a("draw-x", 0) }} />
        <Dotted length={width + inner * 2} style={{ position: "absolute", left: -inner, bottom: 0, transformOrigin: "left", ...a("draw-x", 0) }} />
        {/* dimension line */}
        <div style={{ position: "absolute", left: 0, right: 0, top: -dim, height: 1, background: INK, transformOrigin: "center", ...a("draw-x", 0.45) }} />
        {[0, width].map((x) => (
          <div key={x} style={{ position: "absolute", left: x - tick / 2, top: -dim - tick / 2, width: tick, height: tick, ...a("fade", 0.85) }}>
            <div style={{ position: "absolute", left: "50%", top: "50%", width: Math.SQRT2 * tick, height: 1, background: INK, transform: "translate(-50%, -50%) rotate(-45deg)" }} />
          </div>
        ))}
        <span style={{ ...label, fontSize: 11, lineHeight: "18px", position: "absolute", left: "50%", top: -dim - 9, transform: "translateX(-50%)", background: SURFACE_ALT, color: INK, padding: "0 6px", ...a("fade", 0.7) }}>{fig}</span>
        {/* image */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...a("wipe", 0.25) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        {caption && (
          <p style={{ ...label, lineHeight: "18px", position: "absolute", top: height + capGap + bottom, left: 0, width, margin: 0, color: INK, ...a("fade", 0.9) }}>{caption}</p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Logos */

export type LogoKey = keyof typeof LOGO_PATHS;

export function Logo({ logo, color = INK, height }: { logo: LogoKey; color?: string; height: number }) {
  const l = LOGO_PATHS[logo];
  const [, , w, h] = l.viewBox.split(" ").map(Number);
  return (
    <svg viewBox={l.viewBox} width={(height * w) / h} height={height} role="img" aria-label={l.text} style={{ display: "block" }}>
      <path d={l.d} fill={color} />
    </svg>
  );
}

export function logoSvg(logo: LogoKey, color: string) {
  const l = LOGO_PATHS[logo];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${l.viewBox}"><title>Celine Studio — ${l.name}</title><path d="${l.d}" fill="${color}"/></svg>`;
}

/* ----------------------------------------------------------------- Images */

/** The photo → sketch hover, with the real pair from the site. */
export function SketchHover({ width = 260, height = 340 }: { width?: number; height?: number }) {
  const [on, setOn] = useState(false);
  return (
    <div
      onMouseEnter={() => setOn(true)}
      onMouseLeave={() => setOn(false)}
      onClick={() => setOn((v) => !v)}
      style={{ position: "relative", width, height, overflow: "hidden", cursor: "pointer", background: SURFACE_ALT }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SKETCH_PAIR.photo} alt={SKETCH_PAIR.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SKETCH_PAIR.sketch}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          clipPath: on ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
          transition: `clip-path 0.7s ${EASES[1].css}`,
        }}
      />
      <span style={{ ...label, position: "absolute", left: 12, bottom: 12, color: ON_DARK }}>{on ? "Sketch" : "Photo · hover me"}</span>
    </div>
  );
}

/* ----------------------------------------------------------------- Motion */

const MOTION_CSS = `
@keyframes sg-draw-x{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes sg-draw-y{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes sg-fade{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes sg-rise{from{transform:translateY(130%)}to{transform:none}}
@keyframes sg-wipe{from{clip-path:inset(100% 0 0 0)}to{clip-path:inset(0 0 0 0)}}
@keyframes sg-settle{from{transform:scale(1.08)}to{transform:scale(1)}}
@keyframes sg-parallax{from{transform:translateY(-6%) scale(1.14)}to{transform:translateY(6%) scale(1.14)}}
@media (prefers-reduced-motion: reduce){[data-sg-motion] *{animation:none!important}}
`;

const OUT = EASES[0].css;
const IN_OUT = EASES[1].css;

/** A small loop of one PageMotion effect. Remounted by `run` to replay. */
export function MotionDemo({ motion, run }: { motion: Motion; run: number }) {
  const box: CSSProperties = { position: "relative", height: 120, background: SURFACE, overflow: "hidden" };
  const content = (() => {
    switch (motion.demo) {
      case "rise":
        return (
          <div style={{ padding: "18px 16px", fontFamily: FAMILIES.display, fontWeight: 300, fontSize: 40, lineHeight: 0.92, letterSpacing: "-0.03em", color: INK }}>
            {["Our", "process"].map((w, i) => (
              <div key={w} style={{ overflow: "hidden", paddingBottom: "0.25em", marginBottom: "-0.25em" }}>
                <div style={{ animation: `sg-rise 1.2s ${OUT} ${0.3 + i * 0.12}s both` }}>{w}</div>
              </div>
            ))}
          </div>
        );
      case "draw-x":
        return <Dotted length="80%" style={{ position: "absolute", left: "10%", top: 60, transformOrigin: "left", animation: `sg-draw-x 1.4s ${IN_OUT} both` }} />;
      case "draw-y":
        return [30, 70].map((x, i) => (
          <Dotted key={x} vertical length={120} style={{ position: "absolute", left: `${x}%`, top: 0, transformOrigin: "top", animation: `sg-draw-y 1.4s ${IN_OUT} ${i * 0.12}s both` }} />
        ));
      case "fade":
        return <p style={{ ...label, position: "absolute", left: 16, top: 52, margin: 0, color: INK, animation: `sg-fade 0.9s ${OUT} 0.1s both` }}>Book a consultation ↗</p>;
      case "stagger":
        return (
          <div style={{ padding: 16, display: "grid", gap: 8 }}>
            {["01 Brief", "02 Concept", "03 Design"].map((t, i) => (
              <p key={t} style={{ ...label, margin: 0, color: INK, animation: `sg-fade 0.9s ${OUT} ${i * 0.1}s both` }}>{t}</p>
            ))}
          </div>
        );
      case "wipe":
        return (
          <div style={{ position: "absolute", inset: "12px 25%", overflow: "hidden", animation: `sg-wipe 1.5s ${IN_OUT} both` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SKETCH_PAIR.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", animation: `sg-settle 1.8s ${OUT} both` }} />
          </div>
        );
      case "frame":
        return (
          <div style={{ transform: "scale(0.3)", transformOrigin: "top left", position: "absolute", left: 16, top: -4 }}>
            <FrameDemo src={SKETCH_PAIR.photo} width={260} height={300} animate />
          </div>
        );
      case "parallax":
        return (
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SKETCH_PAIR.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", animation: `sg-parallax 3s linear infinite alternate` }} />
          </div>
        );
    }
  })();
  return (
    <div key={run} data-sg-motion style={box}>
      {content}
    </div>
  );
}
