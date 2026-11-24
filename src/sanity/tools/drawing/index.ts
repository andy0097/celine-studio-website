import { SparklesIcon } from "@sanity/icons/Sparkles";
import type { Tool } from "sanity";
import { DrawingTool } from "./DrawingTool";

/** Photo → Celine-style line drawing → the image's sketch (plan 6.3). */
export function drawingTool(): Tool {
  return { name: "drawing", title: "Drawing generator", icon: SparklesIcon, component: DrawingTool };
}
