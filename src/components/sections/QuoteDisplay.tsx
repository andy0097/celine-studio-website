import { useTranslations } from "next-intl";
import Attribution from "@/components/ui/Attribution";

/** A client quote set large in the display face, centred (HORECA, Street Coffee). */
export default function QuoteDisplay({
  eyebrow,
  quote,
  name,
  initials,
  project,
  stone = false,
}: {
  eyebrow: string;
  quote: string;
  name: string;
  initials: string;
  project: string;
  /** On the stone surface (one band per page at most). */
  stone?: boolean;
}) {
  const t = useTranslations("Common");
  return (
    <section
      aria-label={t("clientTestimonial")}
      className={`relative py-space-5xl lg:py-[128px] ${stone ? "bg-surface-alt" : ""}`}
    >
      <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
      <figure className="container-page flex flex-col items-center gap-space-2xl text-center">
        <p data-fade className={`type-label ${stone ? "" : "text-ink-muted"}`}>{eyebrow}</p>
        <blockquote data-lines className="type-quote max-w-[1040px]">
          “{quote}”
        </blockquote>
        <Attribution data-fade initials={initials} name={name} project={project} />
      </figure>
    </section>
  );
}
