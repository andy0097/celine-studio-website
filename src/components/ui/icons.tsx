/** 14px line icons, stroked at --stroke-icon. */
const stroke = { strokeWidth: "var(--stroke-icon)" };

export function ArrowUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <path d="M2 12L12 2M5 2h7v7" fill="none" stroke="currentColor" style={stroke} />
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <path d="M1 7h12M8 2l5 5-5 5" fill="none" stroke="currentColor" style={stroke} />
    </svg>
  );
}

export function ArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <path d="M13 7H1M6 2L1 7l5 5" fill="none" stroke="currentColor" style={stroke} />
    </svg>
  );
}

/** Plus that turns into a minus when `open`. */
export function PlusMinus({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <path d="M1 7h12" fill="none" stroke="currentColor" style={stroke} />
      <path
        d="M7 1v12"
        fill="none"
        stroke="currentColor"
        style={stroke}
        className={`origin-center transition-transform duration-500 ${open ? "scale-y-0" : ""}`}
      />
    </svg>
  );
}
