import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Tag } from "@/components/ui/labels";
import { ArrowUpRight } from "@/components/ui/icons";
import { useTranslations } from "next-intl";
import { caseLink } from "@/i18n/links";
import type { CaseStudyCard } from "@/sanity/lib/content-types";
import { objectPosition } from "@/sanity/lib/image";

/**
 * Project index: one row per project, image on the left, stacked one under
 * the other between dashed dividers. The whole row links to the case study;
 * hovering wipes the photo into its sketch (when there is one) and lifts the
 * divider to 50%. Rows without a page yet say so instead of "View".
 */
export default function ProjectRows({ projects }: { projects: CaseStudyCard[] }) {
  const t = useTranslations("Common");
  return (
    <ol className="flex flex-col border-b border-dashed border-ink/20">
      {projects.map((p, i) => {
        const href = caseLink(p);
        const tags = [t(p.category), p.location].filter((x): x is string => !!x);
        const meta = [p.area, p.year].filter(Boolean).join(" — ");
        const body = (
          <>
            <div data-wipe className="relative col-span-12 aspect-[440/300] overflow-clip bg-surface-alt lg:col-span-5">
              {p.image?.src && (
              <Image
                src={p.image.src}
                alt={p.image.alt ?? ""}
                fill
                sizes="(min-width: 1024px) 500px, 100vw"
                className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                style={{ objectPosition: objectPosition(p.image) }}
              />
              )}
              {p.image?.sketch && (
                <div
                  aria-hidden
                  className="absolute inset-0 [clip-path:inset(100%_0_0_0)] transition-[clip-path] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:[clip-path:inset(0)] group-focus-visible:[clip-path:inset(0)] motion-reduce:transition-none"
                >
                  <Image src={p.image.sketch} alt="" fill sizes="(min-width: 1024px) 500px, 100vw" className="bg-surface object-cover" />
                </div>
              )}
            </div>

            <span className="type-label col-span-2 leading-[28px] lg:col-span-1">{String(i + 1).padStart(2, "0")}</span>

            <div data-stagger className="col-span-10 flex flex-col justify-between gap-space-lg lg:col-span-4">
              <div className="flex flex-col gap-space-sm">
                <h3 className="type-lead">{p.title}</h3>
                <p className="type-link-list text-ink-muted">{p.summary}</p>
              </div>
              <div className="flex gap-space-xs">
                {tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>

            <div className="col-span-10 col-start-3 flex items-end justify-between gap-space-lg lg:col-span-2 lg:col-start-11 lg:flex-col">
              <span className="type-label text-ink-muted">{meta}</span>
              {href ? (
                <span className="type-link flex items-center gap-space-sm border-b border-ink pb-space-xs">
                  {t("view")}
                  <span className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                    <ArrowUpRight />
                  </span>
                </span>
              ) : (
                <span className="type-label text-ink-subtle">{t("caseStudySoon")}</span>
              )}
            </div>
          </>
        );
        const rowClass =
          "group grid-12 gap-y-space-lg py-space-xl transition-colors duration-500";
        return (
          <li key={p._id} className="border-t border-dashed border-ink/20 transition-colors duration-500 first:border-ink/50 hover:border-ink/50">
            {href ? (
              <Link href={href} className={rowClass}>
                {body}
              </Link>
            ) : (
              <div className={rowClass}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
