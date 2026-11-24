import type { ReactNode } from "react";

/**
 * Four cells in a dashed band (top rule at 50%) with dashed column rules
 * (2 × 2 on tablets, stacked on phones). Street Coffee's value points and
 * results. `strong` puts the column rules at 50% too (results on stone).
 */
export default function FourColumns({ cells, strong = false }: { cells: ReactNode[]; strong?: boolean }) {
  const rule = strong ? "border-l-ink/50" : "border-l-ink/20";
  return (
    <div
      data-stagger
      className={`grid grid-cols-1 border-t border-dashed border-t-ink/50 sm:grid-cols-2 lg:grid-cols-4 ${
        strong ? "" : "border-b border-b-ink/20"
      }`}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className={`flex flex-col gap-space-md border-dashed pt-space-xl pb-[40px] ${rule} ${
            i % 2 === 0 ? "sm:pr-space-lg" : "sm:border-l sm:px-space-lg"
          } ${i % 4 === 0 ? "lg:border-l-0 lg:pl-0" : "lg:border-l lg:pl-space-lg"} ${i % 4 === 3 ? "lg:pr-0" : "lg:pr-space-lg"}`}
        >
          {cell}
        </div>
      ))}
    </div>
  );
}
