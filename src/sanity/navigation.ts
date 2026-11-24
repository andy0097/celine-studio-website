import { BlockElementIcon } from "@sanity/icons/BlockElement";
import { CaseIcon } from "@sanity/icons/Case";
import { ChartUpwardIcon } from "@sanity/icons/ChartUpward";
import { CogIcon } from "@sanity/icons/Cog";
import { ColorWheelIcon } from "@sanity/icons/ColorWheel";
import { CommentIcon } from "@sanity/icons/Comment";
import { DashboardIcon } from "@sanity/icons/Dashboard";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { EyeOpenIcon } from "@sanity/icons/EyeOpen";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { ImagesIcon } from "@sanity/icons/Images";
import { RobotIcon } from "@sanity/icons/Robot";
import { SparklesIcon } from "@sanity/icons/Sparkles";
import { UsersIcon } from "@sanity/icons/Users";
import type { ComponentType } from "react";

/**
 * The admin's side navigation, in order. Each entry with a `tool` opens that
 * Studio tool (its name in sanity.config.ts); entries without one are
 * planned areas, shown as "Soon". The Dashboard reads the same list.
 */
export type NavItem = {
  title: string;
  icon: ComponentType;
  /** Studio tool name; missing = not built yet. */
  tool?: string;
  /** One line for the Dashboard card. */
  description: string;
};

export type NavGroup = { title?: string; items: NavItem[] };

export const NAVIGATION: NavGroup[] = [
  {
    items: [{ title: "Dashboard", icon: DashboardIcon, tool: "dashboard", description: "Overview of the admin." }],
  },
  {
    title: "Content",
    items: [
      { title: "Live preview", icon: EyeOpenIcon, tool: "preview", description: "Browse the site and click any text or image to edit it." },
      { title: "Pages", icon: DocumentsIcon, tool: "pages", description: "The text of every page, in Romanian and English." },
      { title: "Case studies", icon: CaseIcon, tool: "projects", description: "Residential and HORECA projects." },
      { title: "Testimonials", icon: CommentIcon, tool: "testimonials", description: "Client quotes used across the site." },
      { title: "FAQ", icon: HelpCircleIcon, tool: "faq", description: "Questions and answers the pages pick from." },
      { title: "Team", icon: UsersIcon, tool: "team", description: "The people on the Studio page." },
      { title: "Images", icon: ImagesIcon, tool: "images", description: "Every image with its sketch and alt text." },
    ],
  },
  {
    title: "Studio",
    items: [
      { title: "Leads", icon: EnvelopeIcon, tool: "leads", description: "Consultation requests from the booking form." },
      { title: "Analytics", icon: ChartUpwardIcon, tool: "analytics", description: "Visitors, top pages and where people come from." },
      { title: "Components", icon: BlockElementIcon, tool: "components", description: "Every section and element the website is built from." },
      { title: "Style guide", icon: ColorWheelIcon, tool: "style-guide", description: "Colours, type and spacing. The brand's source of truth." },
      { title: "Drawing generator", icon: SparklesIcon, tool: "drawing", description: "Turn a photo into a Celine-style drawing." },
      { title: "Agent", icon: RobotIcon, tool: "agent", description: "Ask for changes to the website in plain words." },
    ],
  },
  {
    items: [{ title: "Site settings", icon: CogIcon, tool: "settings", description: "Contact, services, CTA, footer and SEO defaults." }],
  },
];
