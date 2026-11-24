import Image from "next/image";

export type SketchImageData = {
  src: string;
  alt: string;
  /** object-position */
  position?: string;
  /** Paired line drawing (same framing), wiped in on hover. */
  sketch?: string;
};

/**
 * A photo that wipes into its sketch on hover/focus of the nearest `group`
 * (bottom to top, as on Home). No sketch → no hover effect. Fills its
 * `relative` parent; the parent sets the ratio. `data-wipe` on the parent
 * makes it draw in on scroll.
 */
export default function SketchImage({
  image,
  sizes,
  priority = false,
}: {
  image: SketchImageData;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        className="object-cover"
        style={{ objectPosition: image.position }}
      />
      {image.sketch && (
        <div
          aria-hidden
          className="absolute inset-0 [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:[clip-path:inset(0)] group-focus-visible:[clip-path:inset(0)] motion-reduce:transition-none"
        >
          <Image src={image.sketch} alt="" fill sizes={sizes} className="bg-surface object-cover" style={{ objectPosition: image.position }} />
        </div>
      )}
    </>
  );
}
