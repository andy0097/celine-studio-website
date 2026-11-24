import { ColorWheelIcon } from "@sanity/icons/ColorWheel";
import type { Tool } from "sanity";
import { StyleGuideTool } from "./StyleGuideTool";

/** The brand's read-only reference (plan 3.3), rendered from design-system/tokens.json. */
export function styleGuideTool(): Tool {
  return { name: "style-guide", title: "Style guide", icon: ColorWheelIcon, component: StyleGuideTool };
}
