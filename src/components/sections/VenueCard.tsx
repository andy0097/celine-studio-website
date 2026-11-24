import { Link } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import SketchImage, { type SketchImageData } from "@/components/ui/SketchImage";
import { ArrowUpRight } from "@/components/ui/icons";

/** Image + caption row with an arrow; links when the venue has a page. */
export default function VenueCard({
  title,
  href,
  ratio,
  image,
}: {
  title: string;
  href: AppPathname | null;
  ratio: string;
  image: SketchImageData;
}) {
  const body = (
    <>
      <div data-wipe className={`relative overflow-clip bg-surface-alt ${ratio}`}>
        <div className="absolute inset-0 transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
          <SketchImage image={image} sizes="(min-width: 1024px) 600px, 100vw" />
        </div>
      </div>
      <span data-fade className="flex items-center justify-between gap-space-md">
        <span className="type-link-list">{title}</span>
        {href && (
          <span className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <ArrowUpRight />
          </span>
        )}
      </span>
    </>
  );
  return href ? (
    <Link href={href} className="group flex flex-col gap-space-md">
      {body}
    </Link>
  ) : (
    <div className="group flex flex-col gap-space-md">{body}</div>
  );
}
