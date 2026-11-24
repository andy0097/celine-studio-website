/** Client initials in an ink circle, then name and project. */
export default function Attribution({
  initials,
  name,
  project,
  onDark = false,
  className = "",
  ...rest
}: {
  initials: string;
  name: string;
  project: string;
  onDark?: boolean;
  className?: string;
} & Record<`data-${string}`, string | boolean>) {
  return (
    <figcaption {...rest} className={`flex items-center gap-space-md text-left ${className}`}>
      <span
        aria-hidden
        className={`type-label flex size-10 shrink-0 items-center justify-center rounded-full ${
          onDark ? "bg-surface-alt text-ink" : "bg-ink text-on-dark"
        }`}
      >
        {initials}
      </span>
      <span className="flex flex-col gap-[2px]">
        <span className="type-link">{name}</span>
        <span className={`type-label ${onDark ? "text-on-dark-muted" : "text-ink-muted"}`}>{project}</span>
      </span>
    </figcaption>
  );
}
