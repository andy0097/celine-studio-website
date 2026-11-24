import { DashboardIcon } from "@sanity/icons/Dashboard";
import type { Tool } from "sanity";
import { DashboardTool } from "./DashboardTool";

/** Home screen of /admin. Links to every area of the backend. */
export function dashboardTool(): Tool {
  return { name: "dashboard", title: "Dashboard", icon: DashboardIcon, component: DashboardTool };
}
