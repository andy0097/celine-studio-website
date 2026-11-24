import type { StructureResolver } from "sanity/structure";
import { pageTypes } from "./schemaTypes/pages/pages";

/**
 * One Content tool per sidebar entry (see navigation.ts), so each screen is
 * just a list and the open document, not a chain of panes.
 */

/** Pages: every page singleton (document id = type name). */
export const pagesStructure: StructureResolver = (S) =>
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
    );

/** A plain list of one document type, e.g. all case studies. */
export function typeStructure(type: string, title: string, templates?: string[]): StructureResolver {
  return (S) => {
    const list = S.documentTypeList(type).title(title);
    return templates ? list.initialValueTemplates(templates.map((id) => S.initialValueTemplateItem(id))) : list;
  };
}

/** Site settings: the one settings document. */
export const settingsStructure: StructureResolver = (S) =>
  S.list()
    .title("Settings")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site settings")),
    ]);
