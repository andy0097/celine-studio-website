import type { ComponentKind, ComponentMeta } from "./types";
import { UI_COMPONENTS } from "@/components/ui/ui.meta";
import { SECTION_COMPONENTS } from "@/components/sections/sections.meta";
import { LAYOUT_COMPONENTS } from "@/components/layout/layout.meta";
import { HOME_SECTIONS } from "@/components/home-sections.meta";

/**
 * Every component and section of the site, in library order. The admin
 * component library, the design-system sync, the registry and the agent all
 * read this list. To add one: write its `*.meta.ts` entry next to it and
 * make sure it is included below; `checkRegistry()` must stay empty.
 */
export const REGISTRY: ComponentMeta[] = [
  ...UI_COMPONENTS,
  ...SECTION_COMPONENTS,
  ...HOME_SECTIONS,
  ...LAYOUT_COMPONENTS,
];

export const byKind = (kind: ComponentKind) => REGISTRY.filter((c) => c.kind === kind);
export const getComponent = (name: string) => REGISTRY.find((c) => c.name === name);

/** Problems in the inventory: duplicate names, unknown `uses`, missing samples. */
export function checkRegistry(registry: ComponentMeta[] = REGISTRY): string[] {
  const problems: string[] = [];
  const names = new Set<string>();
  for (const c of registry) {
    if (names.has(c.name)) problems.push(`${c.name}: duplicate name`);
    names.add(c.name);
  }
  for (const c of registry) {
    for (const u of c.uses) if (!names.has(u)) problems.push(`${c.name}: uses unknown "${u}"`);
    for (const key of Object.keys(c.samples.en))
      if (!(key in c.samples.ro)) problems.push(`${c.name}: sample "${key}" missing in RO`);
  }
  return problems;
}
