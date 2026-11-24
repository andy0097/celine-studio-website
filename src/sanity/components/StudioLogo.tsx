"use client";

import type { LogoProps } from "sanity";

/** Celine Studio wordmark for the Studio's top bar (replaces the project title). */
export function StudioLogo(props: LogoProps) {
  return props.renderDefault({
    ...props,
    title: (
      <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 0.95, fontWeight: 600, letterSpacing: "-0.01em" }}>
        <span>Celine</span>
        <span>Studio</span>
      </span>
    ) as unknown as string,
  });
}
