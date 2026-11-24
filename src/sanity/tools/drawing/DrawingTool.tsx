"use client";
/* eslint-disable @next/next/no-img-element -- Studio screen: Sanity CDN images sized through their URL. */

import { CheckmarkIcon } from "@sanity/icons/Checkmark";
import { LaunchIcon } from "@sanity/icons/Launch";
import { SearchIcon } from "@sanity/icons/Search";
import { SparklesIcon } from "@sanity/icons/Sparkles";
import { TrashIcon } from "@sanity/icons/Trash";
import { UploadIcon } from "@sanity/icons/Upload";
import { Badge, Box, Button, Card, Container, Flex, Grid, Heading, Select, Spinner, Stack, Text, TextArea, TextInput } from "@sanity/ui";
import { useToast } from "@sanity/ui/toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import { apiVersion } from "../../env";
import { useAdminApi } from "../leads/useAdminApi";

type Provider = { id: string; title: string; model: string; cost: string; ready: boolean };
type Status = {
  providers: Provider[];
  defaultProvider: string | null;
  usage: { used: number; cap: number };
  customPrompt: boolean;
  prompt: string;
};
type Photo = { _id: string; name: string | null; url: string | null; sketch: string | null; width?: number; height?: number };
/** What the drawing is made from: a library image, or a file uploaded here (saved as a new library image). */
type Source = { kind: "photo"; photo: Photo } | { kind: "upload"; assetId: string; url: string; name: string; width?: number; height?: number };
type Attempt = { assetId: string; url: string; provider: string; model: string; state: "new" | "saving" | "saved" | "discarded" };

const PHOTOS_QUERY = `*[_type == "photo"] | order(defined(sketch.asset) asc, name asc){
  _id, name, "url": image.asset->url, "sketch": sketch.asset->url,
  "width": image.asset->metadata.dimensions.width, "height": image.asset->metadata.dimensions.height
}`;

const thumb = (url: string, w = 320) => `${url}?w=${w}&h=${w}&fit=max&auto=format`;
const imageRef = (assetId: string) => ({ _type: "image", asset: { _type: "reference", _ref: assetId } });

/**
 * Drawing generator (plan 6.3). Pick a library image (those without a sketch
 * first) or upload a photo, generate a line drawing with one of the image
 * models, check that it lines up with the photo, then save it as the image's
 * sketch. Generation runs on the server (/api/admin/drawing) under a monthly
 * cap; saving happens here with the admin's own Sanity access, so it shows in
 * the document's history under their name.
 */
export function DrawingTool() {
  const api = useAdminApi();
  const toast = useToast();
  const router = useRouter();
  const client = useClient({ apiVersion });
  const drafts = useMemo(() => client.withConfig({ perspective: "drafts" }), [client]);

  const [status, setStatus] = useState<Status | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [filter, setFilter] = useState<"missing" | "all">("missing");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<Source | null>(null);
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<"upload" | "generate" | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadStatus = useCallback(
    () =>
      api<Status>("drawing").then(
        (s) => {
          setStatus(s);
          setStatusError(null);
          setProvider((p) => p || s.defaultProvider || "");
        },
        (e: Error) => setStatusError(e.message),
      ),
    [api],
  );
  const loadPhotos = useCallback(() => drafts.fetch<Photo[]>(PHOTOS_QUERY).then(setPhotos), [drafts]);

  useEffect(() => {
    loadStatus();
    loadPhotos();
  }, [loadStatus, loadPhotos]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (photos ?? []).filter((p) => (filter === "all" || !p.sketch) && (!q || (p.name ?? "").toLowerCase().includes(q)));
  }, [photos, filter, query]);
  const missing = photos?.filter((p) => !p.sketch).length ?? 0;

  const choose = (next: Source) => {
    setSource(next);
    setAttempts([]);
  };

  const upload = async (file: File) => {
    setBusy("upload");
    try {
      const asset = await client.assets.upload("image", file, { filename: file.name });
      const dims = (asset.metadata as { dimensions?: { width: number; height: number } } | undefined)?.dimensions;
      choose({ kind: "upload", assetId: asset._id, url: asset.url, name: file.name.replace(/\.[^.]+$/, ""), ...dims });
    } catch (e) {
      toast.push({ status: "error", title: "Upload failed", description: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const generate = async () => {
    if (!source) return;
    setBusy("generate");
    try {
      const res = await api<{ assetId: string; url: string; provider: string; model: string; usage: Status["usage"] }>(
        "drawing/generate",
        {
          method: "POST",
          body: JSON.stringify({
            ...(source.kind === "photo" ? { photoId: source.photo._id, name: source.photo.name } : { assetId: source.assetId, name: source.name }),
            provider,
            notes,
          }),
        },
      );
      setAttempts((all) => [{ assetId: res.assetId, url: res.url, provider: res.provider, model: res.model, state: "new" }, ...all]);
      setStatus((s) => (s ? { ...s, usage: res.usage } : s));
    } catch (e) {
      toast.push({ status: "error", title: "Could not generate the drawing", description: (e as Error).message });
      loadStatus();
    } finally {
      setBusy(null);
    }
  };

  const mark = (assetId: string, state: Attempt["state"]) =>
    setAttempts((all) => all.map((a) => (a.assetId === assetId ? { ...a, state } : a)));

  const save = async (attempt: Attempt) => {
    if (!source) return;
    mark(attempt.assetId, "saving");
    try {
      const sketch = imageRef(attempt.assetId);
      let docId: string;
      if (source.kind === "photo") {
        // Attach to the published image and to its draft, if there is one, so the sketch shows at once.
        docId = source.photo._id;
        const ids = await client.fetch<string[]>(`*[_id in [$id, "drafts." + $id]]._id`, { id: docId });
        const tx = client.transaction();
        ids.forEach((id) => tx.patch(id, (p) => p.set({ sketch })));
        await tx.commit();
      } else {
        // A new library image, as a draft: it still needs its alt text before it can be published.
        const doc = await client.create({
          _id: `drafts.${crypto.randomUUID()}`,
          _type: "photo",
          name: source.name,
          image: imageRef(source.assetId),
          sketch,
        });
        docId = doc._id.replace(/^drafts\./, "");
      }
      // Other unsaved tries of the same photo are no longer needed.
      const others = attempts.filter((a) => a.assetId !== attempt.assetId && a.state === "new");
      await Promise.all(others.map((a) => client.delete(a.assetId).catch(() => undefined)));
      setAttempts((all) =>
        all.map((a) => (a.assetId === attempt.assetId ? { ...a, state: "saved" } : a.state === "new" ? { ...a, state: "discarded" } : a)),
      );
      toast.push({
        status: "success",
        title: source.kind === "photo" ? "Saved as the image's sketch" : "Saved as a new image (draft)",
        description: source.kind === "upload" ? "Open it to add the alt text, then publish." : undefined,
      });
      if (source.kind === "upload") setSource({ kind: "photo", photo: { _id: docId, name: source.name, url: source.url, sketch: attempt.url } });
      loadPhotos();
    } catch (e) {
      mark(attempt.assetId, "new");
      toast.push({ status: "error", title: "Could not save the sketch", description: (e as Error).message });
    }
  };

  const discard = async (attempt: Attempt) => {
    mark(attempt.assetId, "discarded");
    await client.delete(attempt.assetId).catch(() => undefined);
  };

  const openPhoto = (id: string) => router.navigateIntent("edit", { id, type: "photo" });

  const sourceUrl = source?.kind === "photo" ? source.photo.url : source?.url;
  const sourceName = source?.kind === "photo" ? source.photo.name : source?.name;
  const dims = source?.kind === "photo" ? source.photo : source;
  const ready = status?.providers.filter((p) => p.ready) ?? [];
  const capped = status ? status.usage.used >= status.usage.cap : false;

  return (
    <Box padding={[4, 5, 6]} style={{ minHeight: "100%", overflow: "auto" }}>
      <Container width={4}>
        <Stack gap={5}>
          <Flex align="flex-end" justify="space-between" gap={4} wrap="wrap">
            <Stack gap={3}>
              <Heading as="h1" size={4}>
                Drawing generator
              </Heading>
              <Text size={1} muted>
                Turn a photo into a Celine-style line drawing and save it as the image&apos;s sketch.
              </Text>
            </Stack>
            {status && (
              <Badge tone={capped ? "critical" : "default"} fontSize={1} padding={2}>
                {status.usage.used} / {status.usage.cap} drawings this month
              </Badge>
            )}
          </Flex>

          {statusError && (
            <Card tone="critical" padding={4} radius={2} border>
              <Text size={1}>{statusError}</Text>
            </Card>
          )}
          {status && ready.length === 0 && (
            <Card tone="caution" padding={4} radius={2} border>
              <Text size={1}>
                No image model is set up yet. Add one of GEMINI_API_KEY, REPLICATE_API_TOKEN or OPENAI_API_KEY to the website&apos;s
                environment (.env.local and Vercel), then reload.
              </Text>
            </Card>
          )}

          <Grid gridTemplateColumns={[1, 1, 3]} gap={5}>
            {/* ---------------- photo picker */}
            <Stack gap={3}>
              <Flex gap={2}>
                <Box flex={1}>
                  <TextInput icon={SearchIcon} placeholder="Search images" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
                </Box>
                <Select value={filter} onChange={(e) => setFilter(e.currentTarget.value as typeof filter)} style={{ width: "auto" }}>
                  <option value="missing">No sketch ({missing})</option>
                  <option value="all">All ({photos?.length ?? 0})</option>
                </Select>
              </Flex>
              <Button
                icon={UploadIcon}
                mode="ghost"
                text="Upload a photo"
                loading={busy === "upload"}
                onClick={() => fileInput.current?.click()}
              />
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  e.currentTarget.value = "";
                  if (file) upload(file);
                }}
              />
              {!photos ? (
                <Flex justify="center" padding={5}>
                  <Spinner muted />
                </Flex>
              ) : shown.length === 0 ? (
                <Card padding={4} radius={2} tone="transparent" border>
                  <Text size={1} muted>
                    {filter === "missing" && !query ? "Every image has a sketch." : "No images match."}
                  </Text>
                </Card>
              ) : (
                <Grid gridTemplateColumns={2} gap={2} style={{ maxHeight: "70vh", overflow: "auto" }}>
                  {shown.map((p) => {
                    const selected = source?.kind === "photo" && source.photo._id === p._id;
                    return (
                      <Card
                        key={p._id}
                        as="button"
                        radius={2}
                        border
                        tone={selected ? "primary" : "default"}
                        padding={1}
                        onClick={() => choose({ kind: "photo", photo: p })}
                        style={{ cursor: "pointer", textAlign: "left" }}
                      >
                        <Stack gap={2}>
                          <Box style={{ aspectRatio: "4 / 3", background: "var(--card-muted-bg-color, #eee)", overflow: "hidden", borderRadius: 3 }}>
                            {p.url && <img src={thumb(p.url)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </Box>
                          <Box paddingX={1} paddingBottom={1}>
                            <Text size={1} textOverflow="ellipsis">
                              {p.name || "Untitled"}
                            </Text>
                          </Box>
                        </Stack>
                      </Card>
                    );
                  })}
                </Grid>
              )}
            </Stack>

            {/* ---------------- generate and review */}
            <Stack gap={4} style={{ gridColumn: "span 2" }}>
              {!source || !sourceUrl ? (
                <Card padding={5} radius={3} border tone="transparent">
                  <Text muted align="center">
                    Choose an image on the left, or upload a photo.
                  </Text>
                </Card>
              ) : (
                <>
                  <Card padding={4} radius={3} border>
                    <Stack gap={4}>
                      <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                        <Text weight="semibold">{sourceName || "Untitled"}</Text>
                        {source.kind === "photo" && (
                          <Button icon={LaunchIcon} mode="bleed" text="Open image" fontSize={1} onClick={() => openPhoto(source.photo._id)} />
                        )}
                      </Flex>
                      <Grid gridTemplateColumns={[1, 2]} gap={3}>
                        <Frame src={sourceUrl} label="Photo" width={dims?.width} height={dims?.height} />
                        {source.kind === "photo" && source.photo.sketch ? (
                          <Frame src={source.photo.sketch} label="Current sketch" width={dims?.width} height={dims?.height} />
                        ) : (
                          <Card radius={2} tone="transparent" border style={{ display: "grid", placeItems: "center", minHeight: 160 }}>
                            <Text size={1} muted>
                              No sketch yet
                            </Text>
                          </Card>
                        )}
                      </Grid>
                      <Grid gridTemplateColumns={[1, 3]} gap={3}>
                        <Stack gap={2}>
                          <Text size={1} weight="medium">
                            Model
                          </Text>
                          <Select value={provider} onChange={(e) => setProvider(e.currentTarget.value)} disabled={!ready.length}>
                            {status?.providers.map((p) => (
                              <option key={p.id} value={p.id} disabled={!p.ready}>
                                {p.title} · {p.cost}
                                {p.ready ? "" : " (no key)"}
                              </option>
                            ))}
                          </Select>
                        </Stack>
                        <Stack gap={2} style={{ gridColumn: "span 2" }}>
                          <Text size={1} weight="medium">
                            Extra instructions (optional)
                          </Text>
                          <TextArea
                            rows={2}
                            value={notes}
                            placeholder="e.g. leave out the plants, draw the marble veining lightly"
                            onChange={(e) => setNotes(e.currentTarget.value)}
                          />
                        </Stack>
                      </Grid>
                      <Flex justify="flex-end">
                        <Button
                          icon={SparklesIcon}
                          tone="primary"
                          text={attempts.length ? "Generate another" : "Generate drawing"}
                          loading={busy === "generate"}
                          disabled={!provider || capped || busy !== null}
                          onClick={generate}
                        />
                      </Flex>
                      {busy === "generate" && (
                        <Text size={1} muted align="right">
                          Drawing… this usually takes 10 to 60 seconds.
                        </Text>
                      )}
                    </Stack>
                  </Card>

                  {attempts
                    .filter((a) => a.state !== "discarded")
                    .map((a) => (
                      <Card key={a.assetId} padding={4} radius={3} border tone={a.state === "saved" ? "positive" : "default"}>
                        <Stack gap={4}>
                          <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                            <Text size={1} muted>
                              {status?.providers.find((p) => p.id === a.provider)?.title ?? a.provider} · {a.model}
                            </Text>
                            {a.state === "saved" ? (
                              <Badge tone="positive">Saved</Badge>
                            ) : (
                              <Flex gap={2}>
                                <Button icon={TrashIcon} mode="ghost" tone="critical" text="Discard" onClick={() => discard(a)} disabled={a.state === "saving"} />
                                <Button
                                  icon={CheckmarkIcon}
                                  tone="positive"
                                  text={source.kind === "photo" ? "Save as sketch" : "Save as new image"}
                                  loading={a.state === "saving"}
                                  onClick={() => save(a)}
                                />
                              </Flex>
                            )}
                          </Flex>
                          <Compare photo={sourceUrl} sketch={a.url} width={dims?.width} height={dims?.height} />
                          {a.state === "saved" && source.kind === "photo" && (
                            <Flex justify="flex-end">
                              <Button icon={LaunchIcon} mode="bleed" text="Open image" fontSize={1} onClick={() => openPhoto(source.photo._id)} />
                            </Flex>
                          )}
                        </Stack>
                      </Card>
                    ))}

                  {status && (
                    <details>
                      <summary style={{ cursor: "pointer" }}>
                        <Text as="span" size={1} muted>
                          Style instructions sent to the model{status.customPrompt ? " (custom, from DRAWING_STYLE_PROMPT)" : ""}
                        </Text>
                      </summary>
                      <Card marginTop={2} padding={3} radius={2} tone="transparent" border>
                        <Text size={1} muted style={{ whiteSpace: "pre-wrap" }}>
                          {status.prompt}
                        </Text>
                      </Card>
                    </details>
                  )}
                </>
              )}
            </Stack>
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}

const ratio = (w?: number, h?: number) => (w && h ? `${w} / ${h}` : "4 / 3");

function Frame({ src, label, width, height }: { src: string; label: string; width?: number; height?: number }) {
  return (
    <Stack gap={2}>
      <Box style={{ aspectRatio: ratio(width, height), overflow: "hidden", borderRadius: 3, background: "#f4f1ec" }}>
        <img src={thumb(src, 900)} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </Box>
      <Text size={0} muted>
        {label}
      </Text>
    </Stack>
  );
}

/**
 * The sketch laid over the photo with a slider, like the hover wipe on the
 * site: if the lines don't sit on the photo's edges, generate another.
 */
function Compare({ photo, sketch, width, height }: { photo: string; sketch: string; width?: number; height?: number }) {
  const [at, setAt] = useState(50);
  const img = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" } as const;
  return (
    <Stack gap={3}>
      <Box style={{ position: "relative", aspectRatio: ratio(width, height), overflow: "hidden", borderRadius: 3, background: "#f4f1ec" }}>
        <img src={thumb(photo, 1400)} alt="Photo" style={img} />
        <img src={thumb(sketch, 1400)} alt="Generated sketch" style={{ ...img, clipPath: `inset(0 ${100 - at}% 0 0)` }} />
        <Box style={{ position: "absolute", top: 0, bottom: 0, left: `${at}%`, width: 1, background: "#1a1a1a", pointerEvents: "none" }} />
      </Box>
      <input
        type="range"
        min={0}
        max={100}
        value={at}
        onChange={(e) => setAt(Number(e.currentTarget.value))}
        aria-label="Wipe between the sketch and the photo"
        style={{ width: "100%" }}
      />
      <Text size={0} muted>
        Drag to wipe between the sketch (left) and the photo (right). The lines should sit exactly on the photo.
      </Text>
    </Stack>
  );
}
