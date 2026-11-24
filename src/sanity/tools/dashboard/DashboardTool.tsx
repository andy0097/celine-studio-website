"use client";

import { BlockElementIcon } from "@sanity/icons/BlockElement";
import { ChartUpwardIcon } from "@sanity/icons/ChartUpward";
import { ColorWheelIcon } from "@sanity/icons/ColorWheel";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { ImagesIcon } from "@sanity/icons/Images";
import { LaunchIcon } from "@sanity/icons/Launch";
import { RobotIcon } from "@sanity/icons/Robot";
import { SparklesIcon } from "@sanity/icons/Sparkles";
import { Badge, Box, Card, Container, Flex, Grid, Heading, Stack, Text } from "@sanity/ui";
import type { ComponentType } from "react";
import { useCurrentUser } from "sanity";
import { useRouter } from "sanity/router";

type Area = {
  title: string;
  description: string;
  icon: ComponentType;
  /** Studio tool name, once the tool exists. */
  tool?: string;
  /** External link (opens a new tab). */
  href?: string;
};

/** Every area of the backend. Areas without a tool or link show "Coming soon". */
const AREAS: Area[] = [
  { title: "Content", description: "Pages, case studies, services and FAQ in Romanian and English.", icon: DocumentsIcon, tool: "structure" },
  { title: "Leads", description: "Consultation requests from the booking form.", icon: EnvelopeIcon },
  { title: "Analytics", description: "Visitors, top pages and where people come from.", icon: ChartUpwardIcon },
  { title: "Components", description: "Every section and element the website is built from.", icon: BlockElementIcon },
  { title: "Images & assets", description: "All images used on the website, and where.", icon: ImagesIcon },
  { title: "Style guide", description: "Colours, type and spacing. The brand's source of truth.", icon: ColorWheelIcon },
  { title: "Drawing generator", description: "Turn a photo into a Celine-style drawing.", icon: SparklesIcon },
  { title: "Agent", description: "Ask for changes to the website in plain words.", icon: RobotIcon },
];

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
