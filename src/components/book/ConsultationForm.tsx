"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowUpRight } from "@/components/ui/icons";

const PROJECT_TYPES = ["Residential", "HORECA", "On-site visit"];

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[10px] border-b border-ink pb-[10px] transition-colors focus-within:border-ink">
      <label htmlFor={id} className="type-label text-ink-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

const input =
  "type-link-list w-full bg-transparent font-normal outline-none placeholder:text-ink-subtle";

/**
 * Consultation request (Paper "Book a Consultation — B Split", form half).
 * Underlined fields, project type as single-choice chips.
 * TODO: send to the studio's inbox / CRM; for now it only confirms locally.
 */
export default function ConsultationForm() {
  const [type, setType] = useState(PROJECT_TYPES[0]);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div role="status" className="flex max-w-[524px] flex-col gap-space-lg border-t border-dashed border-ink/50 pt-space-xl">
        <p className="type-lead">Thank you.</p>
        <p className="type-body">We’ll call you within one working day to talk about your {type === "On-site visit" ? "site visit" : "project"}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} data-stagger className="flex max-w-[524px] flex-col gap-space-xl">
      <Field label="Name" id="book-name">
        <input id="book-name" name="name" required autoComplete="name" placeholder="Your full name" className={input} />
      </Field>

      <div className="grid grid-cols-1 gap-space-xl sm:grid-cols-2 sm:gap-space-lg">
        <Field label="Email" id="book-email">
          <input id="book-email" name="email" type="email" required autoComplete="email" placeholder="name@email.com" className={input} />
        </Field>
        <Field label="Phone" id="book-phone">
          <input id="book-phone" name="phone" type="tel" autoComplete="tel" placeholder="+40" className={input} />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-space-sm">
        <legend className="type-label pb-space-sm text-ink-muted">Project type</legend>
        <div className="flex flex-wrap gap-space-xs">
          {PROJECT_TYPES.map((t) => {
            const on = t === type;
            return (
              <label
                key={t}
                className={`type-label cursor-pointer border border-ink px-space-md py-[10px] transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-offset-2 ${
                  on ? "bg-ink text-surface" : "hover:bg-ink/5"
                }`}
              >
                <input type="radio" name="type" value={t} checked={on} onChange={() => setType(t)} className="sr-only" />
                {t}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field label="City" id="book-city">
        <input id="book-city" name="city" autoComplete="address-level2" placeholder="Oradea" className={input} />
      </Field>

      <Field label="About the project" id="book-about">
        <textarea
          id="book-about"
          name="about"
          rows={3}
          placeholder="Size, rooms, timeline, budget range…"
          className={`${input} resize-none`}
        />
      </Field>

      <button
        type="submit"
        className="type-link group flex w-full items-center justify-between bg-ink px-[22px] py-space-md text-surface"
      >
        Send request
        <span className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight />
        </span>
      </button>
    </form>
  );
}
