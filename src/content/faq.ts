import type { FaqItem } from "@/components/ui/Faq";

/**
 * FAQ copy. Only the first answer of each list is in the Paper design; the
 * rest are drafts to confirm with Celine (durations, travel, fees).
 */
export const GENERAL_FAQ: FaqItem[] = [
  {
    q: "How much does a project cost?",
    a: "It depends on the area and the scope. After the briefing you get a fixed fee for each stage, so you know the total before any design work starts.",
  },
  {
    q: "How long does it take?",
    a: "Draft: most apartments take a few weeks from briefing to construction drawings; houses and venues take longer. You get a schedule with the brief.",
  },
  {
    q: "Can I book only one stage?",
    a: "Yes. You can take the full process or only the stages you need — a layout, the renders, or site visits while the work is open.",
  },
  {
    q: "Do you work outside Oradea?",
    a: "Draft: yes, across Romania. Site visits outside Oradea are planned together and the travel is agreed in the fee.",
  },
  {
    q: "Do you work with our builders?",
    a: "Yes. We hand your builders, installers and joiners the drawings they work from, and answer their questions on site.",
  },
];

export const ONSITE_FAQ: FaqItem[] = [
  {
    q: "What can we cover in one visit?",
    a: "Usually one to three rooms: layout tweaks, finishes, lighting points and joinery details. Bigger questions are better solved with a full design.",
  },
  {
    q: "Can my builder join?",
    a: "Draft: yes, and it helps — decisions are made with the people who will build them, so nothing is lost in translation.",
  },
  {
    q: "Do you travel outside Oradea?",
    a: "Draft: yes. Visits outside Oradea are scheduled together and the travel is added to the fee.",
  },
  {
    q: "Can the fee count toward a full project?",
    a: "Draft: if you go on to a full design within a few months, the visit fee is deducted from the first stage.",
  },
];
