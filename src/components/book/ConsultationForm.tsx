"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "@/components/ui/icons";

const PROJECT_TYPES = ["residential", "horeca", "onSite"] as const;
type ProjectType = (typeof PROJECT_TYPES)[number];

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
  const t = useTranslations("Form");
  const [type, setType] = useState<ProjectType>(PROJECT_TYPES[0]);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div role="status" className="flex max-w-[524px] flex-col gap-space-lg border-t border-dashed border-ink/50 pt-space-xl">
        <p className="type-lead">{t("thanks")}</p>
        <p className="type-body">{t("thanksText", { kind: type })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} data-stagger className="flex max-w-[524px] flex-col gap-space-xl">
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

      <button
        type="submit"
        className="type-link group flex w-full items-center justify-between bg-ink px-[22px] py-space-md text-surface"
      >
        {t("submit")}
        <span className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight />
        </span>
      </button>
    </form>
  );
}
