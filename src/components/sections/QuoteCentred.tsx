import Attribution from "@/components/ui/Attribution";

/** A single client quote, centred in a quiet band (Residential "05 Testimonial"). */
export default function QuoteCentred({
  quote,
  name,
  initials,
  project,
}: {
  quote: string;
  name: string;
  initials: string;
  project: string;
}) {
  return (
    <section aria-label="Client testimonial" className="relative py-space-5xl lg:py-[calc(2*var(--spacing-space-5xl)+var(--spacing-space-xl))]">
      <span aria-hidden data-line-x className="guide-h pointer-events-none absolute inset-x-0 top-0 origin-left" />
      <figure className="container-page flex flex-col items-center gap-space-3xl">
        <blockquote
          data-lines
          className="type-lead max-w-[602px] text-center leading-[37px] tracking-[-0.02em]"
        >
          “{quote}”
        </blockquote>
        <Attribution data-fade initials={initials} name={name} project={project} />
      </figure>
    </section>
  );
}
