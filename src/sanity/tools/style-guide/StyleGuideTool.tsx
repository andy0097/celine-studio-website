"use client";

/**
 * Style guide (plan 3.3): the brand's single, read-only reference. Rendered
 * from design-system/tokens.json, the font files and the brand guidelines
 * (data.ts). Nothing can be edited here; changes go through the repo.
 * Downloads: logos (SVG/PNG), fonts as licensed, tokens.json, a PDF export.
 */
import { CopyIcon } from "@sanity/icons/Copy";
import { DocumentPdfIcon } from "@sanity/icons/DocumentPdf";
import { DownloadIcon } from "@sanity/icons/Download";
import { LaunchIcon } from "@sanity/icons/Launch";
import { LockIcon } from "@sanity/icons/Lock";
import { PlayIcon } from "@sanity/icons/Play";
import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Stack, Text } from "@sanity/ui";
import { useToast } from "@sanity/ui/toast";
import { useRef, useState, type ReactNode } from "react";
import {
  COLOR_RULES,
  COLORS,
  EASES,
  FONTS,
  FRAME_NOTE,
  FRAMES,
  IMAGE_RULES,
  IMAGE_TYPES,
  LAYOUT,
  LAYOUT_NOTE,
  LINE_KINDS,
  LINE_NOTE,
  LINE_RULES,
  LINES,
  LOGO_RULES,
  MOTION_RULES,
  MOTIONS,
  OVERLAYS,
  PROJECT_NEEDS,
  RADIUS,
  SKETCH_PAIR,
  SKETCH_RULES,
  SPACING,
  TOKEN_RULE,
  TOKENS_VERSION,
  TYPE_GROUPS,
  TYPE_RULES,
  VOICE_DONT,
  VOICE_EXAMPLES,
  VOICE_PRINCIPLES,
  VOICE_RULES,
  type Token,
} from "./data";
import { downloadFile, downloadLogoPng, downloadLogoSvg, downloadTokens } from "./downloads";
import { LOGO_PATHS } from "./logos.generated";
import { exportPdf } from "./PrintGuide";
import { BrandFonts, Dotted, FrameDemo, INK, Logo, MotionDemo, ON_DARK, SketchHover, SURFACE, SURFACE_ALT, Swatch, typeCss, type LogoKey } from "./specimens";

const SECTIONS = [
  { id: "logos", title: "Logos" },
  { id: "colour", title: "Colour" },
  { id: "type", title: "Typography" },
  { id: "spacing", title: "Spacing" },
  { id: "layout", title: "Layout" },
  { id: "lines", title: "Lines and frames" },
  { id: "motion", title: "Motion" },
  { id: "images", title: "Images" },
  { id: "voice", title: "Voice" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function StyleGuideTool() {
  const scroller = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const [printing, setPrinting] = useState(false);

  const copy = (value: string) => {
    void navigator.clipboard?.writeText(value).then(
      () => toast.push({ status: "success", title: `Copied ${value}`, duration: 1500 }),
      () => toast.push({ status: "error", title: "Couldn't copy" }),
    );
  };

  const goTo = (id: SectionId) => {
    const el = scroller.current?.querySelector(`#sg-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onPdf = async () => {
    setPrinting(true);
    try {
      await exportPdf();
    } catch {
      toast.push({ status: "error", title: "Couldn't prepare the PDF" });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Box ref={scroller} style={{ height: "100%", overflow: "auto" }}>
      <BrandFonts />
      <style>{ROW_CSS}</style>
      <Box padding={[4, 5, 6]} paddingBottom={[6, 7, 8]}>
        <Container width={4}>
          <Stack gap={5}>
            {/* Header */}
            <Flex align="flex-end" justify="space-between" gap={4} wrap="wrap">
              <Stack gap={3}>
                <Flex align="center" gap={2}>
                  <Text size={1} muted>
                    Brand reference · tokens v{TOKENS_VERSION}
                  </Text>
                  <Badge fontSize={0} tone="primary" padding={2}>
                    <Flex align="center" gap={1}>
                      <LockIcon /> Read-only
                    </Flex>
                  </Badge>
                </Flex>
                <Heading as="h1" size={4}>
                  Style guide
                </Heading>
                <Text size={1} muted style={{ maxWidth: 560 }}>
                  Generated from the website&apos;s design system ({`design-system/tokens.json`}). To change anything here, change the repo; this page follows. {TOKEN_RULE}
                </Text>
              </Stack>
              <Flex gap={2} wrap="wrap">
                <Button icon={DownloadIcon} mode="ghost" text="tokens.json" onClick={downloadTokens} />
                <Button icon={DocumentPdfIcon} tone="primary" text="Export PDF" loading={printing} onClick={onPdf} />
              </Flex>
            </Flex>

            {/* Section menu */}
            <Card borderTop borderBottom paddingY={2} style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <Flex gap={1} wrap="wrap">
                {SECTIONS.map((s) => (
                  <Button key={s.id} mode="bleed" fontSize={1} padding={2} text={s.title} onClick={() => goTo(s.id)} />
                ))}
              </Flex>
            </Card>

            <Logos />
            <Colours copy={copy} />
            <Typography copy={copy} />
            <Spacing copy={copy} />
            <Layout />
            <Lines />
            <MotionSection />
            <Images />
            <Voice />
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------ Pieces */

/** Monospace token name. */
function Mono({ children, size = 1 }: { children: ReactNode; size?: number }) {
  return (
    <Text size={size}>
      <code style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{children}</code>
    </Text>
  );
}

/** A table-like row: fixed columns on wide screens, stacked on narrow ones. */
function Row({ cols, gap = 0, center, children }: { cols: string; gap?: number; center?: boolean; children: ReactNode }) {
  return (
    <div className="sg-row" style={{ "--sg-cols": cols, gap, alignItems: center ? "center" : undefined } as React.CSSProperties}>
      {children}
    </div>
  );
}

const ROW_CSS = `.sg-row{display:grid;grid-template-columns:1fr}@media (min-width:900px){.sg-row{grid-template-columns:var(--sg-cols)}}`;

function Section({ id, title, intro, children }: { id: SectionId; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <Stack as="section" id={`sg-${id}`} gap={4} paddingTop={5} style={{ scrollMarginTop: 56 }}>
      <Stack gap={3}>
        <Heading as="h2" size={3}>
          {title}
        </Heading>
        {intro && (
          <Text size={1} muted style={{ maxWidth: 640 }}>
            {intro}
          </Text>
        )}
      </Stack>
      {children}
    </Stack>
  );
}

function Rules({ title = "Rules", items }: { title?: string; items: string[] }) {
  return (
    <Card padding={4} radius={2} tone="transparent" border>
      <Stack gap={3}>
        <Text size={1} weight="semibold">
          {title}
        </Text>
        <Stack as="ul" gap={3} style={{ margin: 0, paddingLeft: 18 }}>
          {items.map((r) => (
            <Text as="li" key={r} size={1}>
              {r}
            </Text>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}

/** Brand canvas: the specimens sit on the site's own surface. */
function Canvas({ children, tone = SURFACE, padding = 24, style }: { children: ReactNode; tone?: string; padding?: number; style?: React.CSSProperties }) {
  return <div style={{ background: tone, padding, color: INK, overflow: "hidden", ...style }}>{children}</div>;
}

function TokenTable({ tokens, copy }: { tokens: Token[]; copy?: (v: string) => void }) {
  return (
    <Card radius={2} border overflow="auto">
      <Stack>
        {tokens.map((t, i) => (
          <Card key={t.name} paddingX={3} paddingY={3} borderTop={i > 0}>
            <Row cols="220px 160px 1fr" gap={12}>
              <Flex align="center" gap={2}>
                <Mono size={1}>{t.name}</Mono>
                {copy && <Button icon={CopyIcon} mode="bleed" padding={1} fontSize={0} title={`Copy ${t.name}`} onClick={() => copy(t.name)} />}
              </Flex>
              <Text size={1} muted>
                {t.value}
                {t.lg ? ` → ${t.lg} from lg` : ""}
              </Text>
              <Text size={1}>{t.usage}</Text>
            </Row>
          </Card>
        ))}
      </Stack>
    </Card>
  );
}

/* ------------------------------------------------------------ Sections */

const LOGO_COLOURS = [
  { name: "ink", label: "Ink", value: INK, canvas: SURFACE },
  { name: "on-dark", label: "On dark", value: ON_DARK, canvas: INK },
] as const;

function Logos() {
  const keys = Object.keys(LOGO_PATHS) as LogoKey[];
  return (
    <Section id="logos" title="Logos" intro="Both logos are Rizoma Light set with the type styles, outlined from the font file. Download them as SVG (any size, for print and web) or PNG (2400px wide, transparent).">
      <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
        {keys.map((key) => (
          <Card key={key} radius={2} border overflow="hidden">
            <Grid gridTemplateColumns={2}>
              {LOGO_COLOURS.map((c) => (
                <Canvas key={c.name} tone={c.canvas} padding={0} style={{ height: 180, display: "grid", placeItems: "center" }}>
                  <Logo logo={key} color={c.value} height={key === "stacked" ? 64 : 56} />
                </Canvas>
              ))}
            </Grid>
            <Stack padding={3} gap={3}>
              <Flex align="center" justify="space-between" gap={2}>
                <Text size={1} weight="semibold">
                  {LOGO_PATHS[key].name}
                </Text>
                <Mono size={0}>{LOGO_PATHS[key].style}</Mono>
              </Flex>
              <Flex gap={2} wrap="wrap">
                {LOGO_COLOURS.map((c) => (
                  <Flex key={c.name} gap={1}>
                    <Button icon={DownloadIcon} mode="ghost" fontSize={1} padding={2} text={`SVG · ${c.label}`} onClick={() => downloadLogoSvg(key, c.value, c.name)} />
                    <Button mode="ghost" fontSize={1} padding={2} text="PNG" onClick={() => void downloadLogoPng(key, c.value, c.name)} />
                  </Flex>
                ))}
              </Flex>
            </Stack>
          </Card>
        ))}
      </Grid>
      <Rules items={LOGO_RULES} />
    </Section>
  );
}

function Colours({ copy }: { copy: (v: string) => void }) {
  return (
    <Section id="colour" title="Colour" intro="Cream, stone and one dark. Translucent inks are shown over cream and stone; on-dark and on-photo colours over ink.">
      <Grid gridTemplateColumns={[1, 2, 3, 4]} gap={3}>
        {COLORS.map((c) => (
          <Card key={c.name} radius={2} border overflow="hidden">
            <Swatch color={c} />
            <Stack padding={3} gap={3}>
              <Flex align="center" justify="space-between" gap={1}>
                <Mono size={0}>{c.name}</Mono>
                <Button icon={CopyIcon} mode="bleed" padding={1} fontSize={0} title={`Copy ${c.value}`} onClick={() => copy(c.value)} />
              </Flex>
              <Text size={1} muted>
                {c.value}
              </Text>
              <Text size={1}>{c.usage}</Text>
            </Stack>
          </Card>
        ))}
        {OVERLAYS.map((o) => (
          <Card key={o.name} radius={2} border overflow="hidden">
            <div style={{ height: 96, position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SKETCH_PAIR.photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: o.value }} />
            </div>
            <Stack padding={3} gap={3}>
              <Mono size={0}>{o.name}</Mono>
              <Text size={1}>{o.usage}</Text>
            </Stack>
          </Card>
        ))}
      </Grid>
      <Rules items={COLOR_RULES} />
    </Section>
  );
}

function Typography({ copy }: { copy: (v: string) => void }) {
  return (
    <Section id="type" title="Typography" intro="Two families. Display styles are capped at 120px here; the real size and the fluid range are listed with each style.">
      <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
        {FONTS.map((font) => (
          <Card key={font.family} radius={2} border overflow="hidden">
            <Canvas style={{ height: 150, display: "flex", alignItems: "flex-end" }}>
              <p style={{ margin: 0, fontFamily: font.stack, fontWeight: font.family === "Rizoma" ? 300 : 500, fontSize: font.family === "Rizoma" ? 72 : 32, lineHeight: 0.95, letterSpacing: font.family === "Rizoma" ? "-0.03em" : "0.06em", textTransform: font.family === "Rizoma" ? "none" : "uppercase" }}>
                {font.family === "Rizoma" ? "Aa Celine" : "Aa Studio"}
              </p>
            </Canvas>
            <Stack padding={3} gap={3}>
              <Flex align="center" justify="space-between" gap={2}>
                <Text weight="semibold">{font.family}</Text>
                <Badge tone={font.shareable ? "positive" : "caution"} fontSize={0}>
                  {font.shareable ? "Free licence" : "Trial licence"}
                </Badge>
              </Flex>
              <Text size={1}>{font.role}</Text>
              <Text size={1} muted>
                {font.weights}
              </Text>
              <Text size={1} muted>
                {font.licence}
              </Text>
              <Flex gap={2} wrap="wrap">
                {font.file && (
                  <Button
                    icon={DownloadIcon}
                    mode="ghost"
                    fontSize={1}
                    padding={2}
                    tone={font.shareable ? "default" : "caution"}
                    text={font.shareable ? "Download" : "Download (studio use only)"}
                    onClick={() => downloadFile(font.file!)}
                  />
                )}
                {font.source && <Button as="a" href={font.source.href} target="_blank" rel="noreferrer" icon={LaunchIcon} mode="ghost" fontSize={1} padding={2} text={font.source.label} />}
                <Button icon={CopyIcon} mode="bleed" fontSize={1} padding={2} text="CSS stack" onClick={() => copy(font.stack)} />
              </Flex>
            </Stack>
          </Card>
        ))}
      </Grid>

      {TYPE_GROUPS.map((group) => (
        <Stack key={group.name} gap={3}>
          <Text size={1} weight="semibold">
            {group.name}
          </Text>
          <Card radius={2} border overflow="hidden">
            {group.styles.map((s, i) => (
              <Card key={s.name} borderTop={i > 0}>
                <Row cols="260px 1fr">
                  <Stack padding={3} gap={3}>
                    <Flex align="center" gap={1}>
                      <Mono size={1}>{s.name}</Mono>
                      <Button icon={CopyIcon} mode="bleed" padding={1} fontSize={0} title={`Copy ${s.name}`} onClick={() => copy(s.name)} />
                    </Flex>
                    <Text size={1} muted>
                      {s.fontSize} / {typeof s.lineHeight === "number" ? `${Math.round(parseFloat(s.fontSize) * s.lineHeight)}px` : s.lineHeight} · {s.letterSpacing} · {s.fontWeight}
                      {s.transform ? ` · ${s.transform}` : ""}
                    </Text>
                    {s.fluid && (
                      <Text size={0} muted>
                        {s.fluid}
                      </Text>
                    )}
                    <Text size={1}>{s.usage}</Text>
                  </Stack>
                  <Canvas padding={16} style={{ display: "flex", alignItems: "center", minHeight: 80 }}>
                    <p style={{ ...typeCss(s, group.family, 120), overflowWrap: "anywhere", paddingTop: "0.2em" }}>{s.sample}</p>
                  </Canvas>
                </Row>
              </Card>
            ))}
          </Card>
        </Stack>
      ))}
      <Rules items={TYPE_RULES} />
    </Section>
  );
}

function Spacing({ copy }: { copy: (v: string) => void }) {
  return (
    <Section id="spacing" title="Spacing" intro="One scale for every gap and padding. Classes read like the token, e.g. gap-space-md.">
      <Card radius={2} border overflow="hidden">
        {SPACING.map((t, i) => (
          <Card key={t.name} borderTop={i > 0} paddingX={3} paddingY={2}>
            <Row cols="150px 60px 130px 1fr" gap={12} center>
              <Flex align="center" gap={1}>
                <Mono size={1}>{t.name}</Mono>
                <Button icon={CopyIcon} mode="bleed" padding={1} fontSize={0} title={`Copy ${t.name}`} onClick={() => copy(t.name)} />
              </Flex>
              <Text size={1} muted>
                {t.value}
              </Text>
              <div style={{ width: parseFloat(t.value), height: 16, background: INK }} />
              <Text size={1}>{t.usage}</Text>
            </Row>
          </Card>
        ))}
      </Card>
      <TokenTable tokens={RADIUS} copy={copy} />
    </Section>
  );
}

function Layout() {
  return (
    <Section id="layout" title="Layout" intro={LAYOUT_NOTE}>
      <Card radius={2} border overflow="hidden">
        <Canvas padding={0} style={{ position: "relative", height: 200 }}>
          {/* page guides, 12 columns, top border */}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "7%", right: "7%" }}>
            <Dotted vertical length="100%" style={{ position: "absolute", left: 0, top: 0 }} />
            <Dotted vertical length="100%" style={{ position: "absolute", right: 0, top: 0 }} />
            <div style={{ position: "absolute", top: 40, bottom: 24, left: 16, right: 16, display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 8 }}>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} style={{ background: SURFACE_ALT, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6, fontFamily: '"Instrument Sans", sans-serif', fontSize: 10, letterSpacing: "0.14em" }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
          <Dotted length="100%" style={{ position: "absolute", top: 16, left: 0 }} />
        </Canvas>
      </Card>
      <TokenTable tokens={LAYOUT} />
    </Section>
  );
}

function Lines() {
  return (
    <Section id="lines" title="Lines and frames" intro={`The dotted lines make each page read like an architect's drawing. ${LINE_NOTE} ${FRAME_NOTE}`}>
      <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
        <Card radius={2} border overflow="hidden">
          <Canvas style={{ display: "grid", placeItems: "center" }}>
            <FrameDemo src={SKETCH_PAIR.photo} width={220} height={270} caption="FIG. 01 — Living room, design sketch" />
          </Canvas>
        </Card>
        <Stack gap={3}>
          {LINE_KINDS.map((k) => (
            <Card key={k.title} padding={3} radius={2} border>
              <Stack gap={2}>
                <Text size={1} weight="semibold">
                  {k.title}
                </Text>
                <Text size={1}>{k.text}</Text>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Grid>
      <Grid gridTemplateColumns={[1, 3]} gap={3}>
        {[
          { name: "color-line", bg: SURFACE, line: "color-line" },
          { name: "color-line-on-dark", bg: INK, line: "color-line-on-dark" },
          { name: "color-line-on-photo", bg: "photo", line: "color-line-on-photo" },
        ].map((v) => (
          <Card key={v.name} radius={2} border overflow="hidden">
            <div style={{ position: "relative", height: 90, background: v.bg === "photo" ? `center / cover url(${SKETCH_PAIR.photo})` : v.bg }}>
              <Dotted length="80%" color={COLORS.find((c) => c.name === v.line)?.value} style={{ position: "absolute", left: "10%", top: 44 }} />
            </div>
            <Box padding={3}>
              <Mono size={0}>{v.name}</Mono>
            </Box>
          </Card>
        ))}
      </Grid>
      <Rules items={LINE_RULES} />
      <TokenTable tokens={[...LINES, ...FRAMES]} />
    </Section>
  );
}

function MotionSection() {
  const [runs, setRuns] = useState<Record<string, number>>({});
  const replay = (name: string) => setRuns((r) => ({ ...r, [name]: (r[name] ?? 0) + 1 }));
  return (
    <Section id="motion" title="Motion" intro="The site moves like a drawing being made. Every effect is one of these, set with a data attribute and run by PageMotion. Press play to replay.">
      <Grid gridTemplateColumns={[1, 2, 4]} gap={3}>
        {MOTIONS.map((m) => (
          <Card key={m.name} radius={2} border overflow="hidden">
            <MotionDemo motion={m} run={runs[m.name] ?? 0} />
            <Stack padding={3} gap={3}>
              <Flex align="center" justify="space-between" gap={2}>
                <Text size={1} weight="semibold">
                  {m.name}
                </Text>
                <Button icon={PlayIcon} mode="bleed" padding={2} fontSize={1} title="Replay" onClick={() => replay(m.name)} />
              </Flex>
              <Mono size={0}>{m.attr}</Mono>
              <Text size={1}>{m.what}</Text>
              <Text size={0} muted>
                {m.timing}
              </Text>
            </Stack>
          </Card>
        ))}
      </Grid>
      <Card radius={2} border overflow="hidden">
        {EASES.map((e, i) => (
          <Card key={e.name} borderTop={i > 0} paddingX={3} paddingY={3}>
            <Row cols="160px 300px 1fr" gap={12}>
              <Mono size={1}>{e.name}</Mono>
              <Text size={1} muted>
                {e.css}
              </Text>
              <Text size={1}>{e.use}</Text>
            </Row>
          </Card>
        ))}
      </Card>
      <Rules items={MOTION_RULES} />
    </Section>
  );
}

function Images() {
  return (
    <Section id="images" title="Images" intro="Real projects, photographed well, each with a sketch of the same view.">
      <Row cols="auto 1fr" gap={20}>
        <Stack gap={2}>
          <SketchHover />
          <Text size={0} muted>
            Hover (or tap) for the sketch.
          </Text>
        </Stack>
        <Stack gap={3}>
          <Rules title="Photo → sketch hover" items={SKETCH_RULES} />
          <Rules title="Each project needs" items={PROJECT_NEEDS} />
        </Stack>
      </Row>
      <Card radius={2} border overflow="auto">
        {IMAGE_TYPES.map((t, i) => (
          <Card key={t.type} borderTop={i > 0} paddingX={3} paddingY={3}>
            <Row cols="180px 1fr 200px 200px" gap={12}>
              <Text size={1} weight="semibold">
                {t.type}
              </Text>
              <Text size={1}>{t.shows}</Text>
              <Text size={1} muted>
                {t.ratio}
              </Text>
              <Text size={1} muted>
                {t.where}
              </Text>
            </Row>
          </Card>
        ))}
      </Card>
      <Rules title="Photo standards" items={IMAGE_RULES} />
    </Section>
  );
}

function Voice() {
  return (
    <Section id="voice" title="Voice" intro="How the studio writes, drawn from the site's own copy. Draft until Celine confirms it.">
      <Grid gridTemplateColumns={[1, 2, 4]} gap={3}>
        {VOICE_PRINCIPLES.map((v) => (
          <Card key={v.title} padding={3} radius={2} border>
            <Stack gap={3}>
              <Text size={1} weight="semibold">
                {v.title}
              </Text>
              <Text size={1}>{v.text}</Text>
            </Stack>
          </Card>
        ))}
      </Grid>
      <Card radius={2} border overflow="hidden">
        <Canvas tone={SURFACE_ALT} style={{ display: "grid", gap: 16 }}>
          {VOICE_EXAMPLES.map((e) => (
            <p key={e} style={{ margin: 0, fontFamily: '"Rizoma", "Instrument Sans", sans-serif', fontWeight: 300, fontSize: 32, lineHeight: 1.06, letterSpacing: "-0.02em" }}>
              {e}
            </p>
          ))}
        </Canvas>
      </Card>
      <Grid gridTemplateColumns={[1, 1, 2]} gap={3}>
        <Rules items={VOICE_RULES} />
        <Rules title="Avoid" items={VOICE_DONT} />
      </Grid>
    </Section>
  );
}
