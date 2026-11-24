"use client";

import { LaunchIcon } from "@sanity/icons/Launch";
import { Badge, Box, Card, Container, Flex, Grid, Heading, Stack, Text } from "@sanity/ui";
import type { ComponentType } from "react";
import { useCurrentUser } from "sanity";
import { useRouter } from "sanity/router";
import { NAVIGATION } from "../../navigation";

type Area = { title: string; description: string; icon: ComponentType; tool?: string; href?: string };

/** Every area of the backend, from the side navigation (minus the Dashboard itself). Areas without a tool show "Coming soon". */
const AREAS: Area[] = NAVIGATION.flatMap((group) => group.items).filter((item) => item.tool !== "dashboard");

export function DashboardTool() {
  const user = useCurrentUser();
  const router = useRouter();
  const firstName = user?.name?.split(" ")[0];

  return (
    <Box padding={[4, 5, 6]} style={{ minHeight: "100%", overflow: "auto" }}>
      <Container width={3}>
        <Stack gap={5}>
          <Flex align="flex-end" justify="space-between" gap={4} wrap="wrap">
            <Stack gap={3}>
              <Text size={1} muted>
                Celine Studio admin
              </Text>
              <Heading as="h1" size={4}>
                {firstName ? `Hello, ${firstName}` : "Hello"}
              </Heading>
            </Stack>
            <Card as="a" href="/" target="_blank" rel="noreferrer" padding={3} radius={2} tone="default" border>
              <Flex align="center" gap={2}>
                <Text size={1}>View website</Text>
                <Text size={1}>
                  <LaunchIcon />
                </Text>
              </Flex>
            </Card>
          </Flex>

          <Grid gridTemplateColumns={[1, 2, 3]} gap={3}>
            {AREAS.map((area) => {
              const ready = Boolean(area.tool || area.href);
              const Icon = area.icon;
              const linkProps = area.tool
                ? {
                    as: "a" as const,
                    href: `/admin/${area.tool}`,
                    onClick: (event: React.MouseEvent) => {
                      event.preventDefault();
                      router.navigateUrl({ path: `/admin/${area.tool}` });
                    },
                  }
                : area.href
                  ? { as: "a" as const, href: area.href, target: "_blank", rel: "noreferrer" }
                  : {};
              return (
                <Card
                  key={area.title}
                  {...linkProps}
                  padding={4}
                  radius={3}
                  border
                  tone={ready ? "default" : "transparent"}
                  style={{ opacity: ready ? 1 : 0.7, textDecoration: "none", cursor: ready ? "pointer" : "default" }}
                >
                  <Stack gap={4}>
                    <Flex align="center" justify="space-between">
                      <Text size={3}>
                        <Icon />
                      </Text>
                      {!ready && <Badge fontSize={0}>Coming soon</Badge>}
                    </Flex>
                    <Stack gap={2}>
                      <Text weight="semibold">{area.title}</Text>
                      <Text size={1} muted>
                        {area.description}
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
