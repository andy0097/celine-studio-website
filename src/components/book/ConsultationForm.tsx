"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "@/components/ui/icons";
import { PROJECT_TYPES, type ProjectType } from "@/lib/leads/lead";
import { submitLead, type LeadState } from "@/app/[locale]/(site)/book-a-consultation/actions";

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

const INITIAL: LeadState = { status: "idle" };

/**
 * Consultation request (Paper "Book a Consultation — B Split", form half).
 * Underlined fields, project type as single-choice chips. Sends to the
 * submitLead server action (saved in Supabase, emailed to the studio).
 * `email` is the studio's address, offered when sending fails.
 */
export default function ConsultationForm({ email }: { email: string }) {
  const t = useTranslations("Form");
  const pathname = usePathname();
  const [type, setType] = useState<ProjectType>(PROJECT_TYPES[0]);
  const [state, action, pending] = useActionState(submitLead, INITIAL);

  // Submitted by hand rather than <form action>, which would clear the fields when sending fails
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };

  if (state.status === "sent") {
    return (
      <div role="status" className="flex max-w-[524px] flex-col gap-space-lg border-t border-dashed border-ink/50 pt-space-xl">
        <p className="type-lead">{t("thanks")}</p>
        <p className="type-body">{t("thanksText", { kind: type })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} data-stagger className="flex max-w-[524px] flex-col gap-space-xl">
      <input type="hidden" name="sourcePage" value={pathname} />
      {/* Spam trap: hidden from people, bots fill it in. Named so browser
          autofill never recognises it (a "company" field can be autofilled,
          which silently dropped real enquiries). */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="book-hp">Leave this empty</label>
        <input id="book-hp" name="hp_leave_empty" type="text" tabIndex={-1} autoComplete="new-password" data-1p-ignore data-lpignore="true" />
      </div>

      <Field label={t("name")} id="book-name">
        <input id="book-name" name="name" required autoComplete="name" placeholder={t("namePlaceholder")} className={input} />
      </Field>

      <div className="grid grid-cols-1 gap-space-xl sm:grid-cols-2 sm:gap-space-lg">
        <Field label={t("email")} id="book-email">
          <input id="book-email" name="email" type="email" required autoComplete="email" placeholder={t("emailPlaceholder")} className={input} />
        </Field>
        <Field label={t("phone")} id="book-phone">
          <input id="book-phone" name="phone" type="tel" autoComplete="tel" placeholder="+40" className={input} />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-space-sm">
        <legend className="type-label pb-space-sm text-ink-muted">{t("projectType")}</legend>
        <div className="flex flex-wrap gap-space-xs">
          {PROJECT_TYPES.map((value) => {
            const on = value === type;
            return (
              <label
                key={value}
                className={`type-label cursor-pointer border border-ink px-space-md py-[10px] transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-offset-2 ${
                  on ? "bg-ink text-surface" : "hover:bg-ink/5"
                }`}
              >
                <input type="radio" name="type" value={value} checked={on} onChange={() => setType(value)} className="sr-only" />
                {t(`types.${value}`)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field label={t("city")} id="book-city">
        <input id="book-city" name="city" autoComplete="address-level2" placeholder={t("cityPlaceholder")} className={input} />
      </Field>

      <Field label={t("about")} id="book-about">
        <textarea
          id="book-about"
          name="about"
          rows={3}
          placeholder={t("aboutPlaceholder")}
          className={`${input} resize-none`}
        />
      </Field>

      {(state.status === "error" || state.status === "invalid") && (
        <p role="alert" className="type-body text-ink">
          {t("error", { email })}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="type-link group flex w-full items-center justify-between bg-ink px-[22px] py-space-md text-surface disabled:opacity-60"
      >
        {pending ? t("sending") : t("submit")}
        <span className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight />
        </span>
      </button>
    </form>
  );
}
