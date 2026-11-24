import { SERVICES } from "@/content/services";

/** Column rules and padding: a dashed rule left of every cell but the first in its row. */
function cellClass(i: number) {
  const sm = i % 2 === 0 ? "sm:border-l-0 sm:pl-0 sm:pr-space-xl" : "sm:border-l sm:px-space-xl";
  const lgFirst = i % 3 === 0;
  const lgLast = i % 3 === 2;
  const lg = `${lgFirst ? "lg:border-l-0 lg:pl-0" : "lg:border-l lg:pl-space-xl"} ${lgLast ? "lg:pr-0" : "lg:pr-space-xl"}`;
  return `${sm} ${lg}`;
}

/**
 * The six stages, 3 × 2 (2 × 3 on tablets, stacked on phones), between
 * dashed dividers — the top one at 50%, the rest at 20% — with dashed
 * column rules.
 */
export default function ServicesGrid({ items = SERVICES }: { items?: { title: string; text: string }[] }) {
  return (
    <ol data-stagger className="grid grid-cols-1 border-t border-dashed border-ink/50 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((s, i) => (
        <li
          key={s.title}
          className={`flex flex-col gap-space-md border-b border-dashed border-ink/20 pt-space-xl pb-[40px] ${cellClass(i)}`}
        >
          <span className="type-label text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="type-lead">{s.title}</h3>
          <p className="type-link-list text-ink-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
