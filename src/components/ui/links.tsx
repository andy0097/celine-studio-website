import { Link } from "@/i18n/navigation";
import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "./icons";

type LinkProps = Omit<ComponentProps<typeof Link>, "className" | "children"> & {
  children: ReactNode;
  className?: string;
};

/** Text link: type-link, 1px underline 8px below, 12px gap to the arrow. */
export function TextLink({ children, className = "", ...props }: LinkProps) {
  return (
    <Link
      {...props}
      className={`type-link group/link flex w-max items-center gap-space-sm border-b border-current pb-space-xs ${className}`}
    >
      {children}
      <span className="transition-transform duration-500 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
        <ArrowUpRight />
      </span>
    </Link>
  );
}

/** Primary button: ink fill, surface text, 16 / 22 padding, 14 gap. */
export function ButtonLink({ children, className = "", ...props }: LinkProps) {
  return (
    <Link
      {...props}
      className={`type-link group/link flex w-max items-center gap-[14px] bg-ink px-[22px] py-space-md text-surface ${className}`}
    >
      {children}
      <span className="transition-transform duration-500 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5">
        <ArrowUpRight />
      </span>
    </Link>
  );
}
