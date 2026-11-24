import Faq, { type FaqItem } from "@/components/ui/Faq";
import { Eyebrow } from "@/components/ui/labels";

/** FAQ: title on the left (columns 1–4), accordion on the right (5–12). */
export default function FaqSplit({
  title,
  items,
  stone = false,
}: {
  title: string;
  items: FaqItem[];
  /** Stone band (On-site). */
  stone?: boolean;
}) {
  return (
    <section
      aria-labelledby="faq-title"
      className={`relative py-space-5xl ${stone ? "bg-surface-alt" : "pt-[calc(var(--section-border-offset)+var(--spacing-space-4xl))]"}`}
    >
      <span aria-hidden data-line-x className={`guide-h pointer-events-none absolute inset-x-0 origin-left ${stone ? "top-0" : "top-[var(--section-border-offset)]"}`} />
      <div className="container-page grid-12 gap-y-space-2xl">
        <div className="col-span-12 flex flex-col gap-space-lg lg:col-span-4">
          <Eyebrow data-fade>FAQ</Eyebrow>
          <h2 id="faq-title" data-lines className="type-heading-sm">
            {title}
          </h2>
        </div>
        <Faq items={items} className="col-span-12 lg:col-span-8 lg:col-start-5" />
      </div>
    </section>
  );
}
