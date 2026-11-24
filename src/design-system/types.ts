import type { ColorToken, LayoutToken, RadiusToken, SpacingToken, TypeStyle } from "./token-names";

/**
 * The component inventory: one description per component and section.
 * These descriptions feed the admin component library, the property panel,
 * the Claude Design sync, the component registry and the AI agent. Keep each
 * next to its component (`*.meta.ts`) and add it to `registry.ts`.
 */

export type Locale = "ro" | "en";
export type Localized<T> = Record<Locale, T>;

/** Content the component receives: comes from Sanity (or code for UI strings). */
export type ContentProp =
  | { type: "text"; label: string; localized: boolean; multiline?: boolean; required?: boolean }
  | { type: "list"; label: string; of: string; min?: number; max?: number }
  | { type: "image"; label: string; sketch?: boolean }
  | { type: "link"; label: string }
  | { type: "boolean"; label: string }
  | { type: "select"; label: string; options: readonly string[] };

/**
 * A design parameter the owner may change in the property panel
 * (decision 0.9: token values, texts and variants only — never raw values).
 * `value` is what the component uses today; changing it changes the
 * component everywhere it is used, through a reviewed PR.
 */
export type DesignParam =
  | { type: "color"; label: string; value: ColorToken; options?: readonly ColorToken[] }
  | { type: "spacing"; label: string; value: SpacingToken; options?: readonly SpacingToken[] }
  | { type: "typeStyle"; label: string; value: TypeStyle; options?: readonly TypeStyle[] }
  | { type: "radius"; label: string; value: RadiusToken }
  | { type: "layout"; label: string; value: LayoutToken }
  | { type: "variant"; label: string; value: string; options: readonly string[] };

export type ComponentKind = "component" | "section" | "layout";

export type ComponentMeta = {
  /** Unique name, the same in code, the admin library, Claude Design and the registry. */
  name: string;
  /** component: a building block · section: a page band built from components · layout: page chrome. */
  kind: ComponentKind;
  /** Group in the library (Actions, Labels, Drawing, Media, Text, Lists, Quotes, CTA, Projects, Page). */
  group: string;
  /** One sentence: what it is and when to use it. */
  summary: string;
  /** Repo path of the source, and the export name when it isn't the default export. */
  source: { file: string; export?: string };
  /** Names of the inventory components it is built from. */
  uses: string[];
  props: Record<string, ContentProp>;
  design: Record<string, DesignParam>;
  /** Sample content in both languages (what the library renders). */
  samples: Localized<Record<string, unknown>>;
  /** Routes that use it today. */
  pages: string[];
  /** How it moves (PageMotion data attributes or its own timeline). */
  motion?: string;
  /** The Sanity block or document it maps to (phase 2). */
  sanity?: string;
  notes?: string;
};
