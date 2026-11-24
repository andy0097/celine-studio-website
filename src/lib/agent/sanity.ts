import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Sanity access for the agent. It reads everything (drafts included) and
 * writes only drafts: every mutation targets a `drafts.` id, so nothing it
 * does is live until a person presses Publish in the Studio.
 */
const token = process.env.SANITY_API_WRITE_TOKEN; // Editor token, server only

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" });

/** Document types the agent may create a new draft of. Page singletons and Site settings already exist. */
const CREATABLE_TYPES = ["caseStudy", "photo", "testimonial", "faq", "teamMember"];

const MAX_RESULT_CHARS = 60_000;

const publishedId = (id: string) => id.replace(/^drafts\./, "");
const draftId = (id: string) => `drafts.${publishedId(id)}`;

function clip(value: unknown) {
  const json = JSON.stringify(value, null, 1);
  return json.length > MAX_RESULT_CHARS ? `${json.slice(0, MAX_RESULT_CHARS)}\n… (cut: ${json.length} characters, narrow the query)` : json;
}

function assertDraft(id: string) {
  if (!id.startsWith("drafts.")) throw new Error(`Refusing to write ${id}: the agent only writes drafts`);
}

/** Runs a GROQ query with drafts overlaid on published content. */
export async function query(groq: string, params: Record<string, unknown> = {}) {
  const result = await client.fetch(groq, params, { perspective: "drafts" });
  return clip(result);
}

/** One document as the editor sees it: the draft if there is one, else the published version. */
export async function getDocument(id: string) {
  const [draft, published] = await Promise.all([client.getDocument(draftId(id)), client.getDocument(publishedId(id))]);
  if (!draft && !published) return `No document with id ${publishedId(id)}`;
  return clip({ hasDraft: Boolean(draft), isPublished: Boolean(published), document: draft ?? published });
}

/**
 * Changes fields on the document's draft, creating the draft from the
 * published version first if needed. `set` maps Sanity patch paths
 * (e.g. "title.ro", "sections[_key==\"abc\"].text.en") to values.
 */
export async function editDraft(id: string, set: Record<string, unknown> = {}, unset: string[] = []) {
  const target = draftId(id);
  assertDraft(target);
  const [draft, published] = await Promise.all([client.getDocument(target), client.getDocument(publishedId(id))]);
  const base = draft ?? published;
  if (!base) throw new Error(`No document with id ${publishedId(id)}`);

  const tx = client.transaction();
  if (!draft) {
    // Same starting point the Studio uses when an editor starts typing.
    const { _rev, _updatedAt, _createdAt, ...rest } = base as Record<string, unknown>;
    void _rev;
    void _updatedAt;
    void _createdAt;
    tx.createIfNotExists({ ...(rest as { _type: string }), _id: target });
  }
  let patch = client.patch(target);
  if (Object.keys(set).length) patch = patch.set(set);
  if (unset.length) patch = patch.unset(unset);
  tx.patch(patch);
  await tx.commit({ autoGenerateArrayKeys: true });
  return `Draft ${target} updated. It is not live: someone has to review and publish it in the Studio.`;
}

/** Creates a new draft document of a library type (case study, image, testimonial, FAQ, team member). */
export async function createDraft(type: string, fields: Record<string, unknown>) {
  if (!CREATABLE_TYPES.includes(type)) {
    throw new Error(`Can't create a ${type}. New drafts are possible for: ${CREATABLE_TYPES.join(", ")}`);
  }
  const id = `drafts.${crypto.randomUUID()}`;
  assertDraft(id);
  const { _id, _type, ...rest } = fields;
  void _id;
  void _type;
  await client.create({ ...rest, _id: id, _type: type }, { autoGenerateArrayKeys: true });
  return `Draft ${id} created. It is not live until someone publishes it in the Studio.`;
}

/** Studio link that opens the document, for the reply to the owner. */
export function studioLink(id: string, type: string) {
  return `/admin/intent/edit/id=${publishedId(id)};type=${type}`;
}
