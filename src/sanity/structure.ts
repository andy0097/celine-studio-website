import { CaseIcon } from "@sanity/icons/Case";
import { CogIcon } from "@sanity/icons/Cog";
import { DocumentsIcon } from "@sanity/icons/Documents";
import type { StructureResolver } from "sanity/structure";
import { pageTypes } from "./schemaTypes/pages/pages";

/**
 * The Content tool's menu. Pages and Site settings are singletons: each
 * opens one document whose id is its type name.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Pages")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Pages")
            .items(
              pageTypes.map((t) =>
                S.listItem()
                  .title(t.title ?? t.name)
                  .icon(t.icon)
                  .id(t.name)
                  .child(S.document().schemaType(t.name).documentId(t.name).title(t.title ?? t.name)),
              ),
            ),
        ),
      S.listItem()
        .title("Case studies")
        .icon(CaseIcon)
        .child(
          S.list()
            .title("Case studies")
            .items([
              S.listItem()
                .title("Residential")
                .id("residential")
                .child(
                  S.documentList()
                    .title("Residential")
                    .schemaType("caseStudy")
                    .filter('_type == "caseStudy" && category == "residential"')
                    .initialValueTemplates([S.initialValueTemplateItem("caseStudy-residential")]),
                ),
              S.listItem()
                .title("HORECA")
                .id("horeca")
                .child(
                  S.documentList()
                    .title("HORECA")
                    .schemaType("caseStudy")
                    .filter('_type == "caseStudy" && category == "horeca"')
                    .initialValueTemplates([S.initialValueTemplateItem("caseStudy-horeca")]),
                ),
              S.divider(),
              S.documentTypeListItem("caseStudy").title("All case studies"),
            ]),
        ),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("faq").title("FAQ"),
      S.documentTypeListItem("teamMember").title("Team"),
      S.documentTypeListItem("photo").title("Images"),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
    ]);
