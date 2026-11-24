/** Client-side downloads: logos as SVG and PNG, files from public/, tokens.json. */
import tokens from "../../../../design-system/tokens.json";
import { LOGO_PATHS } from "./logos.generated";
import { logoSvg, type LogoKey } from "./specimens";

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function logoFilename(logo: LogoKey, colorName: string, ext: "svg" | "png") {
  return `celine-studio-${slug(LOGO_PATHS[logo].name)}-${slug(colorName)}.${ext}`;
}

export function downloadLogoSvg(logo: LogoKey, color: string, colorName: string) {
  save(new Blob([logoSvg(logo, color)], { type: "image/svg+xml" }), logoFilename(logo, colorName, "svg"));
}

/** PNG on a transparent background, `width` pixels wide. */
export async function downloadLogoPng(logo: LogoKey, color: string, colorName: string, width = 2400) {
  const [, , w, h] = LOGO_PATHS[logo].viewBox.split(" ").map(Number);
  const height = Math.round((width * h) / w);
  const img = new Image();
  const url = URL.createObjectURL(new Blob([logoSvg(logo, color)], { type: "image/svg+xml" }));
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not draw the logo"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) save(blob, logoFilename(logo, colorName, "png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadTokens() {
  save(new Blob([JSON.stringify(tokens, null, 2)], { type: "application/json" }), "celine-studio-tokens.json");
}

/** A file served from public/ (fonts). */
export function downloadFile(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = href.split("/").pop() ?? "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
