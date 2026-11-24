/** Numbered points between dashed dividers (first divider at 50%, rest 20%). */
export default function NumberedList({
  items,
  rowPadding = "py-[20px]",
  className = "",
}: {
  items: string[];
  rowPadding?: string;
  className?: string;
}) {
  return (
    <ol data-stagger className={`flex flex-col border-b border-dashed border-ink/20 ${className}`}>
      {items.map((item, i) => (
        <li
          key={item}
          className={`flex gap-space-lg border-t border-dashed ${rowPadding} ${i === 0 ? "border-ink/50" : "border-ink/20"}`}
        >
          <span className="type-label w-space-xl shrink-0 leading-5 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
          <span className="type-link-list">{item}</span>
        </li>
      ))}
    </ol>
  );
}
