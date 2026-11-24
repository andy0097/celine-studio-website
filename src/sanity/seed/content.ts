/**
 * The site's content as Sanity documents: the copy that used to live in
 * src/content/*.ts (English) with a Romanian draft next to it.
 *
 * Used twice:
 * - `npm run seed` writes it to seed/production.ndjson and imports it into
 *   the dataset (images are uploaded from /public), see scripts/seed.ts;
 * - the site falls back to it when the dataset doesn't have a document yet
 *   (or Sanity can't be reached), so pages always render (src/sanity/lib/fetch.ts).
 *
 * After the import, Sanity is the source: edit there, not here.
 * Placeholders (XX values, team, venues, FAQ drafts) are marked as in the design.
 * Romanian is a draft to review with Celine (decision 0.3).
 */
import { fig, img, item, L, lines, ref, refItem, richText, slugs, type Doc, type SeedAsset } from "./helpers";

/* ---------- Image files (public/) ---------- */

const A = {
  livingRoom: { id: "image-seed-living-room", path: "images/hero/living-room.png", width: 2852, height: 1864 },
  livingRoomSketch: { id: "image-seed-living-room-sketch", path: "images/hero/living-room_sketch.png", width: 1456, height: 720 },
  livingRoomPanel: { id: "image-seed-living-room-panel", path: "images/projects/living-room_panel.png", width: 386, height: 467 },
  kitchen: { id: "image-seed-kitchen", path: "images/projects/kitchen.png", width: 1440, height: 1920 },
  kitchenPanel: { id: "image-seed-kitchen-panel", path: "images/projects/kitchen_panel.png", width: 600, height: 726 },
  dining: { id: "image-seed-dining", path: "images/projects/dining.png", width: 1440, height: 1920 },
  diningPanel: { id: "image-seed-dining-panel", path: "images/projects/dining_panel.png", width: 620, height: 750 },
  bathroom: { id: "image-seed-bathroom", path: "images/projects/residential/bathroom.png", width: 1440, height: 1084 },
  bathroomSketch: { id: "image-seed-bathroom-sketch", path: "images/projects/residential/bathroom_sketch.png", width: 616, height: 464 },
  lighting: { id: "image-seed-lighting", path: "images/custom-elements/lighting.png", width: 1080, height: 1440 },
  kitchenJoinery: { id: "image-seed-kitchen-joinery", path: "images/custom-elements/kitchen-joinery.png", width: 1440, height: 1920 },
  staircase: { id: "image-seed-staircase", path: "images/custom-elements/staircase.png", width: 1440, height: 1920 },
} satisfies Record<string, SeedAsset>;

export const SEED_ASSETS: SeedAsset[] = Object.values(A);

/* ---------- Image library (photo documents) ---------- */

function photo(
  id: string,
  name: string,
  asset: SeedAsset,
  alt: { ro: string; en: string },
  options: { sketch?: SeedAsset; hotspot?: { x: number; y: number }; project?: string } = {},
): Doc {
  return {
    _id: id,
    _type: "photo",
    name,
    image: img(asset, options.hotspot),
    ...(options.sketch ? { sketch: img(options.sketch) } : {}),
    alt,
    ...(options.project ? { project: ref(options.project) } : {}),
  };
}

const photos: Doc[] = [
  photo(
    "photo-living-room",
    "Apartment Oradea — living room",
    A.livingRoom,
    L(
      "Living cu lustră din răchită, canapea joasă și măsuțe rotunde de cafea",
      "Living room with a woven pendant light, low sectional sofa and round coffee tables",
    ),
    { sketch: A.livingRoomSketch, hotspot: { x: 0.5, y: 0.6 }, project: "caseStudy-apartment-oradea" },
  ),
  photo(
    "photo-living-room-sketch",
    "Apartment Oradea — living room, design sketch",
    A.livingRoomSketch,
    L(
      "Schiță de design a livingului: lustră, canapea și măsuțe rotunde de cafea",
      "Design sketch of the living room: pendant light, sofa and round coffee tables",
    ),
    { hotspot: { x: 0.4, y: 0.5 }, project: "caseStudy-apartment-oradea" },
  ),
  photo(
    "photo-living-room-panel",
    "Hero panel — living room sketch",
    A.livingRoomPanel,
    L("Schiță a livingului", "Sketch of the living room"),
  ),
  photo(
    "photo-kitchen",
    "Apartment Oradea — kitchen",
    A.kitchen,
    L(
      "Bucătărie cu arcadă din stejar, placare din piatră și insulă canelată cu scaune de bar",
      "Kitchen with an oak arch, stone splashback and fluted island with bar stools",
    ),
    { hotspot: { x: 0.55, y: 0.5 }, project: "caseStudy-apartment-oradea" },
  ),
  photo("photo-kitchen-panel", "Hero panel — kitchen detail", A.kitchenPanel, L("Detaliu de mobilier de bucătărie", "Detail of the kitchen joinery")),
  photo(
    "photo-dining",
    "Dining with arched shelving",
    A.dining,
    L(
      "Zonă de dining cu rafturi arcuite din stejar, masă din marmură și bancă tapițată cu model",
      "Dining area with arched oak shelving, marble table and patterned bench",
    ),
  ),
  photo("photo-dining-panel", "Hero panel — dining detail", A.diningPanel, L("Detaliu al rafturilor arcuite", "Detail of the arched shelving")),
  photo(
    "photo-bathroom",
    "Home remodel Oradea — bathroom",
    A.bathroom,
    L(
      "Baie cu oglindă rotundă iluminată, blat din marmură și duș walk-in",
      "Bathroom with a round backlit mirror, marble vanity and walk-in shower",
    ),
    { sketch: A.bathroomSketch, project: "caseStudy-home-remodel-oradea" },
  ),
  photo(
    "photo-lighting",
    "Street Coffee — custom light fixture",
    A.lighting,
    L(
      "Corp de iluminat oval din oțel brunat cu benzi LED încastrate, deasupra barului Street Coffee",
      "Oval blackened-steel light fixture with inset LED strips over the Street Coffee bar",
    ),
    { hotspot: { x: 0.5, y: 0.3 }, project: "caseStudy-street-coffee" },
  ),
  photo(
    "photo-kitchen-joinery",
    "Kitchen joinery — oak",
    A.kitchenJoinery,
    L(
      "Bucătărie din stejar cu nișă arcuită, rafturi deschise și insulă canelată",
      "Oak kitchen with an arched niche, open shelving and a fluted island",
    ),
    { hotspot: { x: 0.6, y: 0.5 } },
  ),
  photo(
    "photo-staircase",
    "Staircase — plaster and oak",
    A.staircase,
    L(
      "Scară curbă din tencuială cu trepte din stejar, lângă un copac de interior",
      "Curved plaster staircase with oak treads beside an indoor tree",
    ),
    { hotspot: { x: 0.5, y: 0.4 } },
  ),
];

/* ---------- Testimonials ---------- */

function testimonial(id: string, quote: { ro: string; en: string }, clientName: string, initials: string, project: { ro: string; en: string }, extra: Record<string, unknown> = {}): Doc {
  return { _id: id, _type: "testimonial", quote, clientName, initials, project, ...extra };
}

const testimonials: Doc[] = [
  testimonial(
    "testimonial-ana-muresan",
    L(
      "Ne doream o cameră liniștită în care să poată trăi toată familia. Celine ne-a explicat fiecare pas, iar rezultatul pare să fi fost dintotdeauna al nostru.",
      "We wanted a calm room the whole family could live in. Celine walked us through every step, and the result feels like it was always ours.",
    ),
    "Ana Mureșan",
    "AM",
    L("Proprietară | Rezidențial — Living, Oradea", "Homeowner | Residential — Living room, Oradea"),
    { image: fig("photo-living-room") },
  ),
  testimonial(
    "testimonial-mihai-pop-light",
    L(
      "Oaspeții noștri observă mai întâi lumina. Corpul de iluminat unicat a devenit semnătura cafenelei, iar tot proiectul s-a încadrat în termen.",
      "Our guests notice the light first. The custom fixture became the signature of our café, and the whole project ran on schedule.",
    ),
    "Mihai Pop",
    "MP",
    L("Proprietar de cafenea | HORECA — Street Coffee, Oradea", "Café owner | HORECA — Street Coffee, Oradea"),
    { image: fig("photo-lighting"), caseStudy: ref("caseStudy-street-coffee") },
  ),
  testimonial(
    "testimonial-mihai-pop-seats",
    L(
      "Ne-au întrebat de la început câte locuri vrem și cum merge servirea la orele de vârf. Tot proiectul a fost construit în jurul acestor răspunsuri.",
      "They asked us from the start how many seats we wanted and how service runs at peak hours. The whole project was built around those answers.",
    ),
    "Mihai Pop",
    "MP",
    L("Proprietar | Street Coffee, Oradea", "Owner | Street Coffee, Oradea"),
    { caseStudy: ref("caseStudy-street-coffee") },
  ),
  testimonial(
    "testimonial-pavel-kitchen",
    L(
      "Fiecare desen, mostră de material și linie de buget au fost clare înainte să înceapă lucrările. Fără surprize, doar o bucătărie în care ne place să gătim.",
      "Every drawing, material sample and budget line was clear before work started. No surprises, just a kitchen we love cooking in.",
    ),
    "Ioana & Radu Pavel",
    "IP",
    L("Proprietari | Rezidențial — Renovare bucătărie", "Homeowners | Residential — Kitchen remodel"),
    { image: fig("photo-kitchen-joinery") },
  ),
  testimonial(
    "testimonial-daniel-crisan",
    L(
      "Celine a transformat o scară dificilă în cea mai frumoasă parte a casei. Echipa ei s-a ocupat de detalii la care nu ne-am fi gândit niciodată.",
      "Celine turned a difficult staircase into the most beautiful part of the house. Her team handled details we would never have thought of.",
    ),
    "Daniel Crișan",
    "DC",
    L("Proprietar | Rezidențial — Casă privată", "Homeowner | Residential — Private house"),
    { image: fig("photo-staircase") },
  ),
  testimonial(
    "testimonial-pavel-house",
    L(
      "Știam cum vrem să trăim, dar nu și cum să ajungem acolo. Fiecare decizie ne-a fost explicată, iar la jumătatea șantierului nu mai rămăsese nimic de descifrat singuri.",
      "We knew how we wanted to live, but not how to get there. Every decision was explained, and halfway through the build there was nothing left for us to decode alone.",
    ),
    "Ioana & Radu Pavel",
    "IP",
    L("Proprietari | Casă de familie, Cluj", "Homeowners | Family house, Cluj"),
    { caseStudy: ref("caseStudy-family-house-cluj") },
  ),
  testimonial(
    "testimonial-pavel-build",
    L(
      "Fiecare desen, material și cost a fost stabilit înainte să înceapă constructorii. La jumătatea șantierului nu mai rămăsese nimic de descifrat singuri.",
      "Every drawing, material and cost was agreed before the builders started. Halfway through the build there was nothing left for us to decode alone.",
    ),
    "Ioana & Radu Pavel",
    "IP",
    L("Proprietari | Casă de familie, Cluj", "Homeowners | Family house, Cluj"),
    { caseStudy: ref("caseStudy-family-house-cluj") },
  ),
];

/* ---------- FAQ (answers marked "Draft" are to confirm with Celine) ---------- */

function faq(id: string, question: { ro: string; en: string }, answer: { ro: string; en: string }, topics: string[]): Doc {
  return { _id: id, _type: "faq", question, answer, topics };
}

const faqs: Doc[] = [
  faq(
    "faq-cost",
    L("Cât costă un proiect?", "How much does a project cost?"),
    L(
      "Depinde de suprafață și de amploare. După briefing primești un onorariu fix pentru fiecare etapă, așa că știi totalul înainte să înceapă orice lucru de design.",
      "It depends on the area and the scope. After the briefing you get a fixed fee for each stage, so you know the total before any design work starts.",
    ),
    ["general", "book"],
  ),
  faq(
    "faq-duration",
    L("Cât durează?", "How long does it take?"),
    L(
      "Draft: majoritatea apartamentelor durează câteva săptămâni de la briefing la planurile de execuție; casele și localurile durează mai mult. Primești un calendar odată cu briefingul.",
      "Draft: most apartments take a few weeks from briefing to construction drawings; houses and venues take longer. You get a schedule with the brief.",
    ),
    ["general", "book"],
  ),
  faq(
    "faq-one-stage",
    L("Pot rezerva o singură etapă?", "Can I book only one stage?"),
    L(
      "Da. Poți alege tot procesul sau doar etapele de care ai nevoie: un plan de amenajare, randările sau vizite pe șantier cât lucrările sunt deschise.",
      "Yes. You can take the full process or only the stages you need — a layout, the renders, or site visits while the work is open.",
    ),
    ["general", "book"],
  ),
  faq(
    "faq-outside-oradea",
    L("Lucrați și în afara Oradiei?", "Do you work outside Oradea?"),
    L(
      "Draft: da, în toată România. Vizitele pe șantier în afara Oradiei le planificăm împreună, iar deplasarea este inclusă în onorariu.",
      "Draft: yes, across Romania. Site visits outside Oradea are planned together and the travel is agreed in the fee.",
    ),
    ["general", "book"],
  ),
  faq(
    "faq-builders",
    L("Lucrați cu constructorii noștri?", "Do you work with our builders?"),
    L(
      "Da. Constructorii, instalatorii și tâmplarii tăi primesc de la noi desenele după care lucrează, iar noi le răspundem la întrebări pe șantier.",
      "Yes. We hand your builders, installers and joiners the drawings they work from, and answer their questions on site.",
    ),
    ["general", "book"],
  ),
  faq(
    "faq-onsite-scope",
    L("Ce putem acoperi într-o vizită?", "What can we cover in one visit?"),
    L(
      "De obicei una până la trei camere: ajustări de amenajare, finisaje, puncte de lumină și detalii de mobilier. Întrebările mai mari se rezolvă mai bine cu un proiect complet.",
      "Usually one to three rooms: layout tweaks, finishes, lighting points and joinery details. Bigger questions are better solved with a full design.",
    ),
    ["onSite"],
  ),
  faq(
    "faq-onsite-builder",
    L("Poate veni și constructorul meu?", "Can my builder join?"),
    L(
      "Draft: da, și ajută: deciziile se iau împreună cu cei care le vor construi, așa că nimic nu se pierde pe drum.",
      "Draft: yes, and it helps — decisions are made with the people who will build them, so nothing is lost in translation.",
    ),
    ["onSite"],
  ),
  faq(
    "faq-onsite-travel",
    L("Vă deplasați în afara Oradiei?", "Do you travel outside Oradea?"),
    L(
      "Draft: da. Vizitele în afara Oradiei se programează împreună, iar deplasarea se adaugă la onorariu.",
      "Draft: yes. Visits outside Oradea are scheduled together and the travel is added to the fee.",
    ),
    ["onSite"],
  ),
  faq(
    "faq-onsite-credit",
    L("Se poate deduce onorariul dintr-un proiect complet?", "Can the fee count toward a full project?"),
    L(
      "Draft: dacă alegi un proiect complet în câteva luni, onorariul vizitei se scade din prima etapă.",
      "Draft: if you go on to a full design within a few months, the visit fee is deducted from the first stage.",
    ),
    ["onSite"],
  ),
];

/* ---------- Team (placeholders) ---------- */

const team: Doc[] = [
  {
    _id: "teamMember-celine",
    _type: "teamMember",
    name: "Celine — Full name",
    role: L("Fondatoare, designer de interior", "Founder, interior designer"),
    bio: L(
      "Scurtă biografie: formare, domenii de interes, un proiect rezidențial și unul HORECA pe care le-a condus.",
      "Short bio — background, focus, a residential and a HORECA project she led.",
    ),
  },
  {
    _id: "teamMember-2",
    _type: "teamMember",
    name: "Full name",
    role: L("Funcție", "Job title"),
    bio: L("Scurtă biografie: două rânduri despre rolul în fiecare proiect.", "Short bio — two lines about their role in each project."),
  },
];

/* ---------- Case studies ---------- */

const RES = { type: L("Tip", "Type"), location: L("Locație", "Location"), area: L("Suprafață", "Area"), year: L("An", "Year"), scope: L("Servicii", "Scope") };

function spec(label: { ro: string; en: string }, value: { ro: string; en: string }) {
  return item("labelValue", { label, value });
}

function titled(title: { ro: string; en: string }, text: { ro: string; en: string }) {
  return item("titledText", { title, text });
}

const caseStudies: Doc[] = [
  {
    _id: "caseStudy-apartment-oradea",
    _type: "caseStudy",
    title: L("Apartament, Oradea", "Apartment, Oradea"),
    slug: slugs("apartament-oradea", "apartment-oradea"),
    category: "residential",
    number: "01",
    summary: L(
      "Un apartament de oraș reorganizat în jurul luminii naturale și al depozitării, cu mobilier făcut pe măsură.",
      "A city apartment reorganised around natural light and storage, with furniture made to measure.",
    ),
    location: L("Oradea", "Oradea"),
    year: 2025,
    area: "XX m²",
    cover: fig("photo-kitchen"),
    hasPage: true,
    lead: L("Un apartament de oraș refăcut în jurul luminii și al depozitării.", "A city apartment rebuilt around light and storage."),
    hero: fig("photo-living-room"),
    specs: [
      spec(RES.type, L("Rezidențial", "Residential")),
      spec(RES.location, L("Oradea, Bihor", "Oradea, Bihor")),
      spec(RES.area, L("XX m²", "XX m²")),
      spec(RES.year, L("2025", "2025")),
      spec(RES.scope, L("Design + supervizare pe șantier", "Design + site supervision")),
    ],
    gallery: [
      item("galleryItem", { image: fig("photo-kitchen", L("Bucătărie — mobilier din nuc, insulă din piatră", "Kitchen — walnut joinery, stone island")), wide: true }),
      item("galleryItem", { image: fig("photo-bathroom", L("Baie — schița peste fotografie", "Bathroom — sketch overlay")), wide: false }),
      item("galleryItem", { image: fig("photo-staircase", L("Hol — scară și stejar", "Hallway — staircase and oak")), wide: false }),
      item("galleryItem", { image: fig("photo-dining", L("Dining — rafturi arcuite", "Dining — arched shelving")), wide: true }),
    ],
    sections: [
      item("conceptSection", {
        intro: {
          eyebrow: L("01 — Concept", "01 — Concept"),
          title: L("Am păstrat ce funcționa și am redesenat restul.", "We kept what worked and redrew the rest."),
          text: L(
            "Am păstrat compartimentarea care funcționa deja și am regândit tot restul în jurul luminii și al depozitării, ca fiecare obiect să aibă locul lui.",
            "We kept the layout that already worked and rethought everything else around light and storage, so every object has a place.",
          ),
        },
        points: lines([
          L(
            "Bucătăria se deschide spre living, cu o insulă care separă și depozitează în același timp.",
            "The kitchen opens to the living area, with an island that both separates and stores.",
          ),
          L("Mobilier desenat pe dimensiunile camerei — fără goluri, fără colțuri moarte.", "Furniture drawn to the room’s dimensions — no gaps, no dead corners."),
          L("Lumină în straturi — generală, de lucru și ambientală, pe scenarii separate.", "Layered lighting — general, task and ambient, on separate scenes."),
        ]),
        sketch: fig("photo-living-room-sketch", L("FIG. 02 — Living, schiță de design", "FIG. 02 — Living room, design sketch")),
      }),
    ],
    next: ref("caseStudy-street-coffee"),
    seo: {
      title: L("Apartament, Oradea — Celine Studio", "Apartment, Oradea — Celine Studio"),
    },
  },
  {
    _id: "caseStudy-family-house-cluj",
    _type: "caseStudy",
    title: L("Casă de familie, Cluj", "Family house, Cluj"),
    slug: slugs("casa-de-familie-cluj", "family-house-cluj"),
    category: "residential",
    number: "02",
    summary: L(
      "O casă de familie în tonuri calde și nuc, gândită după orele zilei și după felul în care familia se mișcă prin ea.",
      "A family home in warm tones and walnut, planned around the hours of the day and how the family moves through it.",
    ),
    location: L("Cluj", "Cluj"),
    year: 2024,
    area: "XX m²",
    cover: fig("photo-dining"),
    hasPage: false,
    lead: L("O casă de familie în tonuri calde și nuc.", "A family home in warm tones and walnut."),
    hero: fig("photo-dining"),
  },
  {
    _id: "caseStudy-home-remodel-oradea",
    _type: "caseStudy",
    title: L("Renovare casă, Oradea", "Home remodel, Oradea"),
    slug: slugs("renovare-casa-oradea", "home-remodel-oradea"),
    category: "residential",
    number: "03",
    summary: L(
      "Renovarea unei case mid-century — baie, bucătărie și rafturi desenate ca o singură familie de detalii.",
      "A mid-century home remodel — bathroom, kitchen and shelving drawn as one family of details.",
    ),
    location: L("Oradea", "Oradea"),
    year: 2024,
    area: "XX m²",
    cover: fig("photo-bathroom"),
    hasPage: false,
    lead: L("Renovarea unei case mid-century.", "A mid-century home remodel."),
    hero: fig("photo-bathroom"),
  },
  {
    _id: "caseStudy-street-coffee",
    _type: "caseStudy",
    title: L("Street Coffee", "Street Coffee"),
    slug: slugs("street-coffee", "street-coffee"),
    category: "horeca",
    number: "01",
    summary: L(
      "O cafenea reorganizată după viteza barului și valoarea fiecărui loc, cu un corp de iluminat unicat.",
      "A café reorganised around how fast the bar serves and how much every seat counts, with a custom light fixture.",
    ),
    location: L("Oradea", "Oradea"),
    area: "XX m²",
    cover: fig("photo-lighting"),
    hasPage: true,
    lead: L(
      "O cafenea reorganizată după cât de repede servește barul și cât contează fiecare loc.",
      "A café reorganised around how fast the bar serves and how much every seat counts.",
    ),
    hero: fig("photo-lighting"),
    specs: [
      spec(RES.type, L("HORECA — Cafenea", "HORECA — Café")),
      spec(RES.location, L("Oradea, Bihor", "Oradea, Bihor")),
      spec(RES.area, L("XX m²", "XX m²")),
      spec(L("Locuri", "Seats"), L("XX la mese + bar", "XX at tables + bar")),
      spec(RES.scope, L("Design complet + iluminat unicat", "Full design + custom lighting")),
    ],
    gallery: [
      item("galleryItem", { image: fig("photo-lighting"), wide: true }),
      item("galleryItem", { image: fig("photo-kitchen"), wide: false }),
      item("galleryItem", { image: fig("photo-dining"), wide: false }),
      item("galleryItem", { image: fig("photo-living-room-sketch"), wide: true }),
    ],
    galleryNote: L(
      "Fotografii provizorii — se înlocuiesc cu ședința foto de la Street Coffee",
      "Placeholder photos — replace with the Street Coffee shoot",
    ),
    sections: [
      item("valueSection", {
        intro: {
          eyebrow: L("01 — Valoare pentru afacere", "01 — Value for the business"),
          title: L("Ce face designul pentru afacerea ta", "What design does for your business"),
          text: L(
            "Un local nu e judecat doar după cum arată, ci și după cum funcționează într-o zi plină.",
            "A venue isn’t judged only by how it looks, but by how it works on a full day.",
          ),
        },
        items: [
          titled(
            L("Locuri așezate după fluxul real", "Seats placed on real flow"),
            L("Mesele urmează locul unde clienții stau la coadă și se așază, ca nimeni să nu blocheze traseul personalului.", "Tables follow where guests queue and sit, so nobody blocks the staff route."),
          ),
          titled(
            L("Un bar gândit pentru orele de vârf", "A bar built for peak hours"),
            L("Zone de lucru destul de scurte încât comenzile să circule fără ca cineva să se încrucișeze.", "Work zones short enough that orders move without anyone crossing paths."),
          ),
          titled(
            L("Materiale pentru trafic zilnic", "Materials for daily traffic"),
            L("Finisaje alese să rămână frumoase după mii de cești — ușor de curățat, greu de marcat.", "Finishes chosen to stay beautiful after thousands of cups — easy to clean, hard to mark."),
          ),
          titled(
            L("Atmosferă în funcție de oră", "Atmosphere by the hour"),
            L("Scenarii de lumină pentru aglomerația de dimineață și pentru seară, ca spațiul să se potrivească ambelor.", "Lighting scenes for the morning rush and the evening, so the room fits both."),
          ),
        ],
      }),
      item("resultsSection", {
        intro: {
          eyebrow: L("02 — Rezultate", "02 — Results"),
          title: L("Ce s-a schimbat, în cifre", "What changed, in numbers"),
          text: L(
            "Ce urmărește orice proprietar: câte locuri are, cum e folosit spațiul, cât durează până la deschidere.",
            "What every owner tracks: how many seats, how the space is used, how long it takes to open.",
          ),
        },
        items: [
          item("statItem", { value: "XX", label: L("Locuri la mese și la bar", "Seats at tables & bar") }),
          item("statItem", { value: "XX m²", label: L("Suprafață proiectată", "Area designed") }),
          item("statItem", { value: "+XX%", label: L("Capacitate de servire la ore de vârf", "Peak-hour serving capacity") }),
          item("statItem", { value: "XX", label: L("Săptămâni de la briefing la predare", "Weeks from briefing to handover") }),
        ],
      }),
      item("testimonialSection", {
        eyebrow: L("Ce spune proprietarul", "What the owner says"),
        testimonial: ref("testimonial-mihai-pop-seats"),
      }),
    ],
    next: ref("caseStudy-apartment-oradea"),
  },
  {
    _id: "caseStudy-restaurant",
    _type: "caseStudy",
    title: L("Restaurant — exemplu", "Restaurant — placeholder"),
    slug: slugs("restaurant", "restaurant"),
    category: "horeca",
    number: "02",
    summary: L("Exemplu — se înlocuiește cu un proiect real.", "Placeholder — replace with a real project."),
    cover: fig("photo-dining"),
    hasPage: false,
    lead: L("Exemplu.", "Placeholder."),
    hero: fig("photo-dining"),
  },
  {
    _id: "caseStudy-bistro-bar",
    _type: "caseStudy",
    title: L("Bistro bar — exemplu", "Bistro bar — placeholder"),
    slug: slugs("bistro-bar", "bistro-bar"),
    category: "horeca",
    number: "03",
    summary: L("Exemplu — se înlocuiește cu un proiect real.", "Placeholder — replace with a real project."),
    cover: fig("photo-kitchen"),
    hasPage: false,
    lead: L("Exemplu.", "Placeholder."),
    hero: fig("photo-kitchen"),
  },
];

/* ---------- Site settings ---------- */

const siteSettings: Doc = {
  _id: "siteSettings",
  _type: "siteSettings",
  contact: {
    email: "hello@celinestudio.ro",
    phone: "+40 745 123 456",
    address: L("Str. Republicii 12, Oradea 410167, România", "Str. Republicii 12, Oradea 410167, Romania"),
    instagram: "https://www.instagram.com/",
  },
  services: [
    titled(
      L("Briefing și analiza spațiului", "Briefing & space analysis"),
      L(
        "Măsurători, fluxuri pentru clienți și personal, capacitate și buget — stabilite înainte de orice schiță.",
        "Measurements, guest and staff routes, capacity and budget — agreed before any sketch.",
      ),
    ),
    titled(
      L("Concept și planuri 2D", "Concept & 2D plans"),
      L(
        "Zonarea, poziția barului și a locurilor, circulația și zonele de lucru, stabilite pe plan.",
        "Zoning, the bar and seating positions, circulation and work areas, set on plan.",
      ),
    ),
    titled(
      L("Randări 3D și materiale", "3D renders & materials"),
      L(
        "Imagini realiste după care să decizi, plus finisaje, textile și iluminat alese împreună.",
        "Realistic images to decide with, plus finishes, textiles and lighting chosen together.",
      ),
    ),
    titled(
      L("Planuri de execuție", "Construction drawings"),
      L(
        "Documentația după care lucrează constructorii, instalatorii și atelierul de tâmplărie.",
        "The documentation builders, installers and the joinery workshop work from.",
      ),
    ),
    titled(
      L("Mobilier la comandă", "Custom furniture"),
      L("Baruri, banchete și corpuri desenate pentru spațiu — nu alese din catalog.", "Bars, banquettes and units drawn to the space — not picked from a catalogue."),
    ),
    titled(
      L("Consultanță pe șantier", "On-site consultancy"),
      L("Vizite pe șantier și decizii luate la timp, cât lucrările sunt încă deschise.", "Site visits and decisions made on time, while the work is still open."),
    ),
  ],
  servicesIntro: {
    title: L("Tot ce este inclus", "Everything included"),
    text: L("Șase etape. Vezi ce primești la fiecare înainte să semnezi.", "Six stages. You see what you get at each one before you sign."),
  },
  onSite: {
    duration: L("XX ore", "XX hours"),
    fee: L("XXX lei", "XXX lei"),
  },
  cta: {
    fig: L("FIG. 00 — Camera ta, înainte de prima schiță", "FIG. 00 — Your room, before the first sketch"),
    title: L("Totul începe cu o conversație.", "It all starts with a conversation."),
    buttonLabel: L("Programează o consultanță gratuită", "Book a free consultation"),
  },
  footer: {
    projects: [
      refItem("caseStudy-apartment-oradea"),
      refItem("caseStudy-street-coffee"),
      refItem("caseStudy-home-remodel-oradea"),
      refItem("caseStudy-family-house-cluj"),
    ],
    tagline: L("Interioare rezidențiale și HORECA — Oradea, România", "Residential & HORECA interiors — Oradea, Romania"),
    newsletterTitle: L("Abonează-te la newsletter", "Join our newsletter"),
    newsletterText: L("Proiecte noi și note din studio, de câteva ori pe an.", "New projects and studio notes, a few times a year."),
    legalLinks: [
      item("link", { label: L("Politica de confidențialitate", "Privacy policy"), kind: "page", page: "/privacy" }),
      item("link", { label: L("Instagram", "Instagram"), kind: "external", url: "https://www.instagram.com/" }),
    ],
  },
  seo: {
    title: L("Celine Studio — Design interior rezidențial și HORECA", "Celine Studio — Residential & HORECA interior design"),
    description: L(
      "Celine Studio — arhitectură de interior și design pentru case, cafenele, restaurante și hoteluri. Oradea, România.",
      "Celine Studio — interior architecture and design for homes, cafés, restaurants and hotels. Oradea, Romania.",
    ),
  },
};

/* ---------- Pages (singletons, id = type name) ---------- */

const BOOK_CTA = L("Programează o consultanță", "Book a consultation");
const SITE_VISIT_CTA = L("Programează o vizită pe șantier", "Schedule a site visit");

const homePage: Doc = {
  _id: "homePage",
  _type: "homePage",
  hero: {
    tagline: L("Design interior rezidențial și HORECA", "Residential & HORECA interior design"),
    ctaLabel: BOOK_CTA,
    slides: [
      item("heroSlide", {
        title: L("Living luminos și deschis", "Light, open living room"),
        location: L("Oradea", "Oradea"),
        image: fig("photo-living-room"),
        panel: fig("photo-living-room-panel"),
        caseStudy: ref("caseStudy-apartment-oradea"),
      }),
      item("heroSlide", {
        title: L("Apartament japandi", "Japandi apartment"),
        location: L("Oradea", "Oradea"),
        image: fig("photo-kitchen"),
        panel: fig("photo-kitchen-panel"),
      }),
      item("heroSlide", {
        title: L("Casă minimalistă", "Minimalist house"),
        location: L("Cluj", "Cluj"),
        image: fig("photo-dining"),
        panel: fig("photo-dining-panel"),
      }),
    ],
  },
  categories: {
    residential: [refItem("caseStudy-apartment-oradea"), refItem("caseStudy-family-house-cluj"), refItem("caseStudy-home-remodel-oradea")],
    horeca: [refItem("caseStudy-street-coffee"), refItem("caseStudy-restaurant"), refItem("caseStudy-bistro-bar")],
  },
  customElements: {
    title: L("Elemente unicat proiectate de noi", "Custom elements that we have designed"),
    items: [
      item("customElement", { title: L("Iluminat", "Lighting"), image: fig("photo-lighting") }),
      item("customElement", { title: L("Mobilier de bucătărie", "Kitchen joinery"), image: fig("photo-kitchen-joinery") }),
      item("customElement", { title: L("Scară", "Staircase"), image: fig("photo-staircase") }),
    ],
  },
  process: {
    title: L("Procesul nostru", "Our process"),
    paragraphs: [
      item("localeText", L(
        "La Celine Studio, abordarea noastră face drumul de la concept la final cât mai simplu și mai plăcut cu putință.",
        "Our approach at Celine Studio is designed to make your journey from concept to completion as smooth and enjoyable as possible.",
      )),
      item("localeText", L(
        "Prin procesul nostru în patru etape punem pe primul loc claritatea, colaborarea și viziunea ta. La fiecare pas te ținem informat, inspirat și implicat.",
        "With our four-stage process, we prioritise clarity, collaboration and your unique vision. At every step, we keep you informed, inspired and involved.",
      )),
    ],
    ctaLabel: L("Descoperă procesul nostru", "Discover our process"),
    image: fig("photo-living-room-sketch"),
  },
  testimonials: {
    title: L("Cuvinte frumoase de la clienții noștri", "Kind words from our clients"),
    items: [
      refItem("testimonial-ana-muresan"),
      refItem("testimonial-mihai-pop-light"),
      refItem("testimonial-pavel-kitchen"),
      refItem("testimonial-daniel-crisan"),
    ],
  },
  seo: {
    title: L("Celine Studio — Design interior rezidențial și HORECA", "Celine Studio — Residential & HORECA interior design"),
    description: L(
      "Celine Studio — arhitectură de interior și design pentru case, cafenele, restaurante și hoteluri. Oradea, România.",
      "Celine Studio — interior architecture and design for homes, cafés, restaurants and hotels. Oradea, Romania.",
    ),
  },
};

const residentialPage: Doc = {
  _id: "residentialPage",
  _type: "residentialPage",
  hero: {
    eyebrow: L("Proiecte / Rezidențial", "Projects / Residential"),
    title: L("Rezidențial", "Residential"),
    intro: L("Fiecare proiect pornește de la felul în care trăiești.", "Every project starts with the way you live."),
    services: lines([
      L("Compartimentări în jurul luminii și al depozitării", "Layouts around light and storage"),
      L("Mobilier desenat pe măsură", "Furniture drawn to measure"),
      L("Lumină în straturi, materiale alese împreună cu tine", "Lighting in layers, materials chosen with you"),
      L("Vizite pe șantier până la ultimul raft", "Site visits until the last shelf is in"),
    ]),
    ctaLabel: BOOK_CTA,
    image: fig("photo-living-room", L("FIG. 01 — Living, Apartament Oradea", "FIG. 01 — Living room, Apartment Oradea")),
  },
  projects: {
    title: L("Proiecte finalizate", "Completed projects"),
    items: [refItem("caseStudy-apartment-oradea"), refItem("caseStudy-family-house-cluj"), refItem("caseStudy-home-remodel-oradea")],
  },
  onSite: {
    title: L("Ai nevoie doar de un sfat pe șantier?", "Just need advice on your build site?"),
    text: L(
      "Compartimentări, finisaje și lumină decise pe loc, cât lucrările sunt încă deschise.",
      "Layouts, finishes and lighting decided on the spot, while the work is still open.",
    ),
    ctaLabel: SITE_VISIT_CTA,
    image: fig("photo-staircase"),
  },
  testimonial: ref("testimonial-pavel-house"),
  seo: {
    title: L("Rezidențial — Celine Studio", "Residential — Celine Studio"),
    description: L(
      "Design interior rezidențial: compartimentări în jurul luminii și al depozitării, mobilier desenat pe măsură, vizite pe șantier până la ultimul raft.",
      "Residential interior design: layouts around light and storage, furniture drawn to measure, site visits until the last shelf is in.",
    ),
  },
};

const horecaPage: Doc = {
  _id: "horecaPage",
  _type: "horecaPage",
  hero: {
    eyebrow: L("Proiecte / HORECA", "Projects / HORECA"),
    title: L("HORECA", "HORECA"),
    intro: L("Un spațiu la fel de unic ca ideea ta.", "A space as unique as your idea."),
    text: L(
      "Cafenele, restaurante și hoteluri gândite după cum funcționează cu adevărat servirea — fluxul clienților, traseele personalului, orele de vârf — și construite ca să rămână în minte.",
      "Cafés, restaurants and hotels planned around how service really runs — guest flow, staff routes, peak hours — and built to be remembered.",
    ),
    ctaLabel: BOOK_CTA,
    image: fig("photo-lighting", L("FIG. 01 — Corp de iluminat unicat", "FIG. 01 — Custom fixture")),
    imageNote: L("Street Coffee, Oradea", "Street Coffee, Oradea"),
  },
  venues: {
    title: L("Localuri", "Venues"),
    note: L("Cafenele — Restaurante — Hoteluri", "Cafés — Restaurants — Hotels"),
    items: [
      item("venue", { title: L("Street Coffee, Oradea", "Street Coffee, Oradea"), caseStudy: ref("caseStudy-street-coffee"), image: fig("photo-lighting"), tall: true }),
      item("venue", { title: L("Restaurant — exemplu", "Restaurant — placeholder"), image: fig("photo-dining"), tall: false }),
      item("venue", { title: L("Bistro bar — exemplu", "Bistro bar — placeholder"), image: fig("photo-kitchen"), tall: false }),
      item("venue", { title: L("Hotel boutique — exemplu", "Boutique hotel — placeholder"), image: fig("photo-staircase"), tall: true }),
    ],
  },
  services: {
    title: L("Ce este inclus", "What’s included"),
    text: L("Șase etape. Vezi ce primești la fiecare înainte să semnezi.", "Six stages. You see what you get at each one before you sign."),
  },
  testimonial: {
    eyebrow: L("Ce spune un proprietar", "What an owner says"),
    testimonial: ref("testimonial-mihai-pop-light"),
  },
  seo: {
    title: L("HORECA — Celine Studio", "HORECA — Celine Studio"),
    description: L(
      "Cafenele, restaurante și hoteluri gândite după cum funcționează cu adevărat servirea — fluxul clienților, traseele personalului, orele de vârf.",
      "Cafés, restaurants and hotels planned around how service really runs — guest flow, staff routes, peak hours — and built to be remembered.",
    ),
  },
};

const processPage: Doc = {
  _id: "processPage",
  _type: "processPage",
  hero: {
    eyebrow: L("Proces", "Process"),
    title: L("De la idee la spațiu", "From idea to a space"),
    intro: L(
      "Patru etape. La fiecare știi exact ce primești și ce decizi.",
      "Four stages. At each one you know exactly what you receive and what you decide.",
    ),
    note: L(
      "Fără surprize la jumătatea șantierului: fiecare desen, material și cost e stabilit înainte să înceapă etapa următoare.",
      "No surprises halfway through the build: every drawing, material and cost is agreed before the next stage starts.",
    ),
    ctaLabel: BOOK_CTA,
  },
  steps: [
    item("processStep", {
      title: L("Briefing", "Briefing"),
      text: L(
        "Ne întâlnim la fața locului, măsurăm totul și vorbim despre cum trăiești sau cum funcționează localul tău, despre buget și calendar.",
        "We meet on site, measure everything and talk through how you live or how your venue works, the budget and the timeline.",
      ),
      receive: lines([L("Releveul spațiului", "Measured survey of the space"), L("Brief scris, buget și calendar", "Written brief, budget and schedule")]),
    }),
    item("processStep", {
      title: L("Design 2D", "2D design"),
      text: L(
        "Variante de amenajare pe plan, până când e stabilit cum funcționează spațiul — înainte să alegem cum arată.",
        "Layout options on plan, until the way the space works is settled — before anything is chosen for how it looks.",
      ),
      receive: lines([L("2–3 variante de amenajare", "2 to 3 layout options"), L("Planul final de mobilare", "Final furniture plan")]),
    }),
    item("processStep", {
      title: L("Randări 3D și documentație", "3D renders & documentation"),
      text: L(
        "Imagini realiste ale fiecărei camere, materiale alese împreună, apoi desenele după care lucrează constructorii și tâmplarii.",
        "Realistic images of every room, materials chosen together, then the drawings your builders and joiners work from.",
      ),
      receive: lines([L("Randări 3D pentru fiecare cameră", "3D renders of each room"), L("Lista de materiale și planuri de execuție", "Materials list and construction drawings")]),
    }),
    item("processStep", {
      title: L("Supervizarea designului", "Design supervision"),
      text: L(
        "Venim pe șantier și răspundem la întrebările constructorilor, ca ce se construiește să fie ce s-a desenat.",
        "We visit the site and answer the builders’ questions, so what gets built matches what was drawn.",
      ),
      receive: lines([L("Vizite programate pe șantier", "Scheduled site visits"), L("O verificare finală la predare", "A final walk-through at handover")]),
    }),
  ],
  services: {
    title: L("Toate serviciile noastre", "All our services"),
    text: L("Alege tot procesul sau doar etapele de care ai nevoie.", "Take the full process, or only the stages you need."),
  },
  faq: {
    title: L("Întrebări pe care le auzim des", "Questions we hear often"),
    items: ["faq-cost", "faq-duration", "faq-one-stage", "faq-outside-oradea", "faq-builders"].map(refItem),
  },
  seo: {
    title: L("Proces — Celine Studio", "Process — Celine Studio"),
    description: L(
      "Patru etape. La fiecare știi exact ce primești și ce decizi.",
      "Four stages. At each one you know exactly what you receive and what you decide.",
    ),
  },
};

const studioPage: Doc = {
  _id: "studioPage",
  _type: "studioPage",
  hero: {
    eyebrow: L("Studioul — Oradea", "The studio — Oradea"),
    title: L("Design care face viața de zi cu zi mai ușoară", "Design that makes daily life easier"),
    intro: L(
      "Pentru familiile care locuiesc în camerele noastre și pentru proprietarii care își conduc afacerea în ele.",
      "For the families who live in our rooms and the owners who run their business in them.",
    ),
    image: fig("photo-dining", L("FIG. 01 — Exemplu: portret al studioului sau spațiul de lucru", "FIG. 01 — Placeholder: studio portrait or workspace")),
    since: L("Din 20XX", "Since 20XX"),
  },
  philosophy: {
    eyebrow: L("Filosofia noastră", "Our philosophy"),
    title: L("Cum proiectăm", "How we design"),
    intro: L(
      "Patru principii din spatele fiecărui proiect rezidențial și HORECA pe care îl preluăm.",
      "Four principles behind every residential and HORECA project we take on.",
    ),
    principles: [
      titled(L("Întâi funcțiunea", "Function first"), L("Stabilim cum funcționează spațiul înainte să alegem cum arată.", "We settle how the space works before choosing how it looks.")),
      titled(L("Lumina dă forma planului", "Light shapes the plan"), L("Camerele urmează lumina zilei; lumina artificială vine în straturi.", "Rooms follow the daylight; artificial light comes in layers.")),
      titled(L("Desenat pe măsură", "Drawn to measure"), L("Mobilier și corpuri de iluminat la comandă, nu compromisuri din catalog.", "Custom joinery and fixtures instead of catalogue compromises.")),
      titled(L("Fiecare decizie explicată", "Every decision explained"), L("Știi mereu ce primești, cât costă și de ce.", "You always know what you get, what it costs and why.")),
    ],
  },
  work: {
    title: L("Proiectele noastre", "Our work"),
    images: [
      item("workImage", { image: fig("photo-kitchen"), tall: true }),
      item("workImage", { image: fig("photo-bathroom"), tall: false }),
      item("workImage", { image: fig("photo-lighting"), tall: false }),
      item("workImage", { image: fig("photo-staircase"), tall: true }),
      item("workImage", { image: fig("photo-living-room"), tall: true }),
      item("workImage", { image: fig("photo-living-room-sketch"), tall: false }),
    ],
    ctaLabel: L("Vezi toate proiectele", "See all projects"),
  },
  team: {
    eyebrow: L("Echipa", "Team"),
    title: L("Oamenii din spatele desenelor", "The people behind the drawings"),
    members: [refItem("teamMember-celine"), refItem("teamMember-2")],
  },
  seo: {
    title: L("Studio — Celine Studio", "Studio — Celine Studio"),
    description: L(
      "Design care face viața de zi cu zi mai ușoară — pentru familiile care locuiesc în camerele noastre și pentru proprietarii care își conduc afacerea în ele.",
      "Design that makes daily life easier — for the families who live in our rooms and the owners who run their business in them.",
    ),
  },
};

const onSitePage: Doc = {
  _id: "onSitePage",
  _type: "onSitePage",
  hero: {
    eyebrow: L("Consultanță pe șantier", "On-site consultancy"),
    title: L("Sfaturi pe șantier, cât lucrările sunt încă deschise", "Advice on your build site, while the work is open"),
    intro: L(
      "Nu ești pregătit pentru un proiect complet? Un designer vine pe șantier, se uită la ce s-a construit și te ajută să decizi pe loc compartimentări, finisaje și lumină.",
      "Not ready for a full design? A designer comes to the site, looks at what’s built and helps you decide layouts, finishes and lighting on the spot.",
    ),
    ctaLabel: SITE_VISIT_CTA,
    image: fig("photo-staircase", L("FIG. 01 — Scară decisă pe șantier", "FIG. 01 — Staircase decided on site")),
  },
  visit: {
    title: L("Cum decurge o vizită", "How a visit works"),
    steps: [
      titled(L("Înainte", "Before"), L("Trimite-ne fotografii, planuri și întrebările tale, ca vizita să fie folosită pentru decizii.", "Send us photos, plans and your questions so the visit is spent on decisions.")),
      titled(L("Pe șantier", "On site"), L("Parcurgem spațiul împreună — și cu constructorul tău, dacă vrei — și lămurim fiecare întrebare.", "We walk the space with you — and your builder if you like — and settle each question.")),
      titled(L("După", "After"), L("Un rezumat scris al fiecărei decizii, cu schițe acolo unde ajută.", "A written summary of every decision, with sketches where they help.")),
    ],
  },
  faq: {
    title: L("Despre vizitele pe șantier", "About site visits"),
    items: ["faq-onsite-scope", "faq-onsite-builder", "faq-onsite-travel", "faq-onsite-credit"].map(refItem),
  },
  seo: {
    title: L("Consultanță pe șantier — Celine Studio", "On-site consultancy — Celine Studio"),
    description: L(
      "Nu ești pregătit pentru un proiect complet? Un designer vine pe șantier și te ajută să decizi pe loc compartimentări, finisaje și lumină.",
      "Not ready for a full design? A designer comes to the site and helps you decide layouts, finishes and lighting on the spot.",
    ),
  },
};

const bookPage: Doc = {
  _id: "bookPage",
  _type: "bookPage",
  hero: {
    eyebrow: L("Consultanță gratuită — 30 min", "Free consultation — 30 min"),
    title: L("Hai să vorbim despre spațiul tău", "Let’s talk about your space"),
    intro: L(
      "Spune-ne despre proiect. Te sunăm în cel mult o zi lucrătoare.",
      "Tell us about the project. We’ll call you within one working day.",
    ),
    image: fig("photo-living-room"),
  },
  testimonials: ["testimonial-pavel-build", "testimonial-ana-muresan", "testimonial-mihai-pop-light", "testimonial-daniel-crisan"].map(refItem),
  faq: {
    eyebrow: L("Întrebări frecvente", "FAQ"),
    title: L("Întrebări pe care le auzim des", "Questions we hear often"),
    items: ["faq-cost", "faq-duration", "faq-one-stage", "faq-outside-oradea", "faq-builders"].map(refItem),
  },
  seo: {
    title: L("Programează o consultanță — Celine Studio", "Book a consultation — Celine Studio"),
    description: L(
      "Consultanță gratuită de 30 de minute. Spune-ne despre proiect și te sunăm în cel mult o zi lucrătoare.",
      "Free 30-minute consultation. Tell us about the project and we’ll call you within one working day.",
    ),
  },
};

const privacyPage: Doc = {
  _id: "privacyPage",
  _type: "privacyPage",
  title: L("Politica de confidențialitate", "Privacy policy"),
  sections: [
    item("privacySection", {
      title: L("Cine suntem", "Who we are"),
      anchor: { _type: "slug", current: "who-we-are" },
      body: richText(
        "Celine Studio Art este un studio de design interior cu sediul în Oradea, România. Suntem operatorul datelor personale pe care ni le transmiți prin acest site, prin e-mail sau telefonic.",
        "Celine Studio Art is an interior design studio based in Oradea, Romania. We are the controller of the personal data you share with us through this website, by email or by phone.",
      ),
    }),
    item("privacySection", {
      title: L("Ce date colectăm", "Data we collect"),
      anchor: { _type: "slug", current: "data-we-collect" },
      body: richText(
        "Când programezi o consultanță sau te abonezi la newsletter colectăm numele, adresa de e-mail, numărul de telefon, orașul și detaliile despre proiect pe care alegi să ni le dai. Colectăm și statistici de bază, anonime, despre cum este folosit site-ul.",
        "When you book a consultation or join our newsletter we collect your name, email, phone number, city and the details you choose to share about your project. We also collect basic, anonymous analytics about how the site is used.",
      ),
    }),
    item("privacySection", {
      title: L("De ce le folosim", "Why we use it"),
      anchor: { _type: "slug", current: "why-we-use-it" },
      body: richText(
        "Doar ca să răspundem cererii tale, să pregătim o ofertă, să ducem proiectul la bun sfârșit dacă ne alegi și — dacă te-ai abonat — să îți trimitem câteva note din studio pe an. Nu vindem niciodată datele tale.",
        "Only to reply to your request, prepare a proposal, run the project if you hire us, and — if you subscribed — send a few studio notes a year. We never sell your data.",
      ),
    }),
    item("privacySection", {
      title: L("Cât timp le păstrăm", "How long we keep it"),
      anchor: { _type: "slug", current: "how-long-we-keep-it" },
      body: richText(
        "Solicitările se păstrează XX luni. Documentele de proiect se păstrează atât cât cere legislația din România.",
        "Enquiries are kept for XX months. Project records are kept as long as Romanian law requires.",
      ),
    }),
    item("privacySection", {
      title: L("Drepturile tale", "Your rights"),
      anchor: { _type: "slug", current: "your-rights" },
      body: richText(
        "Conform GDPR poți cere să îți vezi, corectezi, exporți sau ștergi datele și îți poți retrage consimțământul oricând. Poți depune și o plângere la ANSPDCP, autoritatea română pentru protecția datelor.",
        "Under the GDPR you can ask to see, correct, export or delete your data, and you can withdraw consent at any time. You can also complain to ANSPDCP, the Romanian data protection authority.",
      ),
    }),
    item("privacySection", {
      title: L("Contact", "Contact"),
      anchor: { _type: "slug", current: "contact" },
      body: richText(
        "Scrie-ne la hello@celinestudio.ro pentru orice întrebare despre datele tale.",
        "Write to hello@celinestudio.ro with any question about your data.",
      ),
    }),
  ],
  note: L(
    "Text provizoriu — trebuie verificat de un avocat înainte de lansare.",
    "Placeholder copy — to be reviewed by a lawyer before launch.",
  ),
  seo: {
    title: L("Politica de confidențialitate — Celine Studio", "Privacy policy — Celine Studio"),
    description: L(
      "Cum colectează, folosește și păstrează Celine Studio Art datele tale personale.",
      "How Celine Studio Art collects, uses and keeps your personal data.",
    ),
  },
};

/** Every seed document, in import order (images first, then what references them). */
export const SEED_DOCUMENTS: Doc[] = [
  ...photos,
  ...testimonials,
  ...faqs,
  ...team,
  ...caseStudies,
  siteSettings,
  homePage,
  residentialPage,
  horecaPage,
  processPage,
  studioPage,
  onSitePage,
  bookPage,
  privacyPage,
];
