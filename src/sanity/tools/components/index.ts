import { BlockElementIcon } from "@sanity/icons/BlockElement";
import type { Tool } from "sanity";
import { route } from "sanity/router";
import { ComponentsTool } from "./ComponentsTool";

/**
 * Components: the site's component library (plan 3.4). Two lists,
 * components and sections, read from the registry
 * (src/design-system/registry.ts); each entry is rendered by the real
 * component at 390 / 768 / 1440 px in RO or EN (/admin-render). The open
 * entry is in the URL: /admin/components/<Name>.
 */
export function componentsTool(): Tool {
  return {
    name: "components",
    title: "Components",
    icon: BlockElementIcon,
    component: ComponentsTool,
    router: route.create("/", [route.create("/:name")]),
  };
}
