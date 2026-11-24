/** Project facts in one dashed band: Type · Location · Area · Year · Scope. */
export default function SpecRow({ specs }: { specs: { label: string; value: string }[] }) {
  return (
    <dl data-stagger className="grid grid-cols-2 border-y border-dashed border-ink/50 sm:grid-cols-3 lg:grid-cols-5">
      {specs.map((s) => (
        <div key={s.label} className="flex flex-col gap-space-xs py-[20px] pr-space-lg">
          <dt className="type-label text-ink-muted">{s.label}</dt>
          <dd className="type-link-list">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
