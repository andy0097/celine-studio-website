import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import { ExitPreview } from "./ExitPreview";

/**
 * Click-to-edit overlays for the live preview. Renders nothing for normal
 * visitors; in draft mode it adds Sanity's overlays and, outside /admin,
 * an "Exit preview" button. Mount once in the site layout.
 */
export async function PreviewTools() {
  if (!(await draftMode()).isEnabled) return null;
  return (
    <>
      <VisualEditing />
      <ExitPreview />
    </>
  );
}
