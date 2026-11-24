"use client";

import { Badge, Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import type { LayoutProps, ToolMenuProps } from "sanity";
import { useRouter, useRouterState } from "sanity/router";
import { NAVIGATION } from "../navigation";

const SIDEBAR_WIDTH = 232;

/**
 * Admin layout: a fixed side navigation on the left (wide screens) and the
 * active tool on the right. The top bar keeps the logo, search and account;
 * on small screens its menu button opens the Studio's own tool drawer.
 */
export function StudioLayout(props: LayoutProps) {
  return (
    <Flex height="fill" style={{ height: "100%" }}>
      <Card
        as="nav"
        aria-label="Admin"
        borderRight
        display={["none", "none", "block"]}
        style={{ width: SIDEBAR_WIDTH, flex: "none", overflowY: "auto" }}
      >
        <Sidebar />
      </Card>
      <Box flex={1} style={{ minWidth: 0 }}>
        {props.renderDefault(props)}
      </Box>
    </Flex>
  );
}

function Sidebar() {
  const router = useRouter();
  const activeTool = useRouterState((state) => (typeof state.tool === "string" ? state.tool : undefined));

  return (
    <Stack gap={4} padding={3} paddingTop={4}>
      {NAVIGATION.map((group, i) => (
        <Stack key={group.title ?? i} gap={1}>
          {group.title && (
            <Box paddingX={3} paddingBottom={2}>
              <Text size={1} muted weight="medium">
                {group.title}
              </Text>
            </Box>
          )}
          {group.items.map((item) =>
            item.tool ? (
              <Button
                key={item.title}
                as="a"
                href={`/admin/${item.tool}`}
                mode="bleed"
                justify="flex-start"
                icon={item.icon}
                text={item.title}
                selected={activeTool === item.tool}
                onClick={(event: React.MouseEvent) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                  event.preventDefault();
                  router.navigateUrl({ path: `/admin/${item.tool}` });
                }}
              />
            ) : (
              <Button
                key={item.title}
                mode="bleed"
                justify="flex-start"
                icon={item.icon}
                text={
                  <Flex align="center" justify="space-between" gap={2}>
                    <span>{item.title}</span>
                    <Badge fontSize={0}>Soon</Badge>
                  </Flex>
                }
                disabled
              />
            ),
          )}
        </Stack>
      ))}
    </Stack>
  );
}

/** The top bar's tool tabs are replaced by the sidebar; the mobile drawer keeps them. */
export function StudioToolMenu(props: ToolMenuProps & { renderDefault: (p: ToolMenuProps) => React.JSX.Element }) {
  return props.context === "sidebar" ? props.renderDefault(props) : null;
}
