import { RobotIcon } from "@sanity/icons/Robot";
import type { Tool } from "sanity";
import { AgentTool } from "./AgentTool";
import { trackLastPage } from "./lastPage";

/** Chat with the website agent: content drafts in Sanity, code changes as pull requests. */
export function agentTool(): Tool {
  trackLastPage();
  return { name: "agent", title: "Agent", icon: RobotIcon, component: AgentTool };
}
