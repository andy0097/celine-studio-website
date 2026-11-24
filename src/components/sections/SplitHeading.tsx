import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/labels";

/**
 * Section intro: eyebrow + title on the left, a short paragraph bottom-right
 * (the two-column header used across the inner pages).
 */
export default function SplitHeading({
  id,
  eyebrow,
  title,
  text,
  titleClass = "type-heading-sm",
  titleWidth = "max-w-[720px]",
  eyebrowClass,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  titleClass?: string;
  titleWidth?: string;
  eyebrowClass?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-space-xl gap-y-space-lg pb-space-3xl">
      <div className={`flex flex-col gap-space-lg ${titleWidth}`}>
        {eyebrow && (
          <Eyebrow data-fade className={eyebrowClass}>
            {eyebrow}
          </Eyebrow>
        )}
        <h2 id={id} data-lines className={titleClass}>
          {title}
        </h2>
      </div>
      {text && (
        <p data-fade className="type-body max-w-[360px] pb-space-xs">
          {text}
        </p>
      )}
    </div>
  );
}
