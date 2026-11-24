"use client";

import { Box, Card, Flex, Stack, Text } from "@sanity/ui";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/design-system/types";

/** The three widths every entry is checked at, with the viewport height each frame shows. */
export const VIEWPORTS = [
  { width: 390, height: 844, label: "Phone" },
  { width: 768, height: 1024, label: "Tablet" },
  { width: 1440, height: 900, label: "Desktop" },
] as const;

export type Width = (typeof VIEWPORTS)[number]["width"];

const GAP = 24;

/** Width of an element, kept up to date. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/**
 * The entry rendered by the site itself (/admin-render/<locale>/<name>) in
 * real-size iframes, scaled down to fit. "All" puts the three widths side by
 * side at one scale, so their proportions stay true; one width alone fills
 * the space (never above 100%). Each frame scrolls like a real screen.
 */
export function Preview({
  name,
  locale,
  widths,
  reloadKey,
  onPick,
}: {
  name: string;
  locale: Locale;
  widths: Width[];
  reloadKey: number;
  onPick: (width: Width) => void;
}) {
  const [ref, available] = useWidth<HTMLDivElement>();
  const shown = VIEWPORTS.filter((v) => widths.includes(v.width));
  const total = shown.reduce((sum, v) => sum + v.width, 0) + GAP * (shown.length - 1);
  const scale = available ? Math.min(1, available / total) : 0;
  const src = `/admin-render/${locale}/${encodeURIComponent(name)}`;

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {scale > 0 && (
        <Flex gap={0} align="flex-start" style={{ columnGap: GAP * scale }}>
          {shown.map((v) => (
            <Stack key={v.width} gap={2} style={{ width: v.width * scale, flex: "none" }}>
              <button
                type="button"
                onClick={() => onPick(v.width)}
                title={`Show ${v.width}px only`}
                style={{ all: "unset", cursor: shown.length > 1 ? "pointer" : "default" }}
              >
                <Text size={1} muted>
                  {v.label} · {v.width}px{scale < 1 ? ` · ${Math.round(scale * 100)}%` : ""}
                </Text>
              </button>
              <Card border radius={2} overflow="hidden" style={{ width: v.width * scale, height: v.height * scale }}>
                <iframe
                  key={`${src}-${reloadKey}`}
                  src={src}
                  title={`${name} at ${v.width}px (${locale.toUpperCase()})`}
                  loading="lazy"
                  style={{
                    width: v.width,
                    height: v.height,
                    border: 0,
                    display: "block",
                    transform: `scale(${scale})`,
                    transformOrigin: "0 0",
                  }}
                />
              </Card>
            </Stack>
          ))}
        </Flex>
      )}
      {!scale && <Box style={{ height: 200 }} />}
    </div>
  );
}
