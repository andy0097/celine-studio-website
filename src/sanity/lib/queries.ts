/**
 * GROQ queries for the site. Every translatable field is read in the
 * request's language ($locale) with Romanian as the fallback, so a missing
 * English translation shows Romanian instead of nothing. Result shapes are
 * in content-types.ts.
 */

/** A localized field in the current language, falling back to Romanian. */
const t = (field: string) => `coalesce(select($locale == "en" => ${field}.en), ${field}.ro)`;
/* (GROQ reads `field[$locale]` as a filter, not a key, hence the select.) */

/** A `figure` (library image + caption) as the site uses it. */
export const IMAGE = `{
  "src": photo->image.asset->url,
  "alt": ${t("photo->alt")},
  "sketch": photo->sketch.asset->url,
  "hotspot": photo->image.hotspot{x, y},
  "caption": ${t("caption")}
}`;

/** A case study as lists, cards, the footer and "Next project" show it. */
const CARD_FIELDS = `
  _id,
  "title": ${t("title")},
  "slug": coalesce(select($locale == "en" => slug.en.current), slug.ro.current),
  category,
  number,
  "summary": ${t("summary")},
  "location": ${t("location")},
  year,
  area,
  "hasPage": hasPage != false,
  "image": cover${IMAGE}
`;
export const CASE_STUDY_CARD = `{${CARD_FIELDS}}`;

const TESTIMONIAL = `{
  _id,
  "quote": ${t("quote")},
  "name": clientName,
  initials,
  "project": ${t("project")},
  "image": image${IMAGE}
}`;

const FAQ = `{ "q": ${t("question")}, "a": ${t("answer")} }`;
const TITLED = `{ "title": ${t("title")}, "text": ${t("text")} }`;
const LINES = `[]{"text": coalesce(select($locale == "en" => @.en), @.ro)}.text`;
const SEO = `seo{ "title": ${t("title")}, "description": ${t("description")}, "image": image.asset->url }`;

/** Shared by many pages: contact, stages, closing CTA, footer, default SEO. */
export const SETTINGS_QUERY = `*[_id == "siteSettings"][0]{
  "contact": contact{ email, phone, "address": ${t("address")}, instagram },
  "services": services[]${TITLED},
  "servicesIntro": servicesIntro${TITLED},
  "onSite": onSite{ "duration": ${t("duration")}, "fee": ${t("fee")} },
  "cta": cta{ "fig": ${t("fig")}, "title": ${t("title")}, "buttonLabel": ${t("buttonLabel")} },
  "footer": footer{
    "projects": projects[]->${CASE_STUDY_CARD},
    "tagline": ${t("tagline")},
    "newsletterTitle": ${t("newsletterTitle")},
    "newsletterText": ${t("newsletterText")},
    "legalLinks": legalLinks[]{
      "label": ${t("label")},
      kind,
      page,
      url,
      "slug": caseStudy->{"s": coalesce(select($locale == "en" => slug.en.current), slug.ro.current)}.s
    }
  },
  ${SEO}
}`;

export const HOME_QUERY = `*[_id == "homePage"][0]{
  "hero": hero{
    "tagline": ${t("tagline")},
    "ctaLabel": ${t("ctaLabel")},
    "slides": slides[]{
      _key,
      "title": ${t("title")},
      "location": ${t("location")},
      "image": image${IMAGE},
      "panel": panel${IMAGE},
      "slug": caseStudy->{"s": coalesce(select($locale == "en" => slug.en.current), slug.ro.current), "p": hasPage != false}
    }
  },
  "categories": categories{
    "residential": residential[]->${CASE_STUDY_CARD},
    "horeca": horeca[]->${CASE_STUDY_CARD}
  },
  "customElements": customElements{
    "title": ${t("title")},
    "items": items[]{ _key, "title": ${t("title")}, "image": image${IMAGE} }
  },
  "process": process{
    "title": ${t("title")},
    "paragraphs": paragraphs${LINES},
    "ctaLabel": ${t("ctaLabel")},
    "image": image${IMAGE}
  },
  "testimonials": testimonials{ "title": ${t("title")}, "items": items[]->${TESTIMONIAL} },
  ${SEO}
}`;

export const RESIDENTIAL_QUERY = `*[_id == "residentialPage"][0]{
  "hero": hero{
    "eyebrow": ${t("eyebrow")},
    "title": ${t("title")},
    "intro": ${t("intro")},
    "services": services${LINES},
    "ctaLabel": ${t("ctaLabel")},
    "image": image${IMAGE}
  },
  "projects": projects{
    "title": ${t("title")},
    "items": coalesce(items[]->${CASE_STUDY_CARD}, *[_type == "caseStudy" && category == "residential"] | order(number asc)${CASE_STUDY_CARD})
  },
  "onSite": onSite{ "title": ${t("title")}, "text": ${t("text")}, "ctaLabel": ${t("ctaLabel")}, "image": image${IMAGE} },
  "testimonial": testimonial->${TESTIMONIAL},
  ${SEO}
}`;

export const HORECA_QUERY = `*[_id == "horecaPage"][0]{
  "hero": hero{
    "eyebrow": ${t("eyebrow")},
    "title": ${t("title")},
    "intro": ${t("intro")},
    "text": ${t("text")},
    "ctaLabel": ${t("ctaLabel")},
    "image": image${IMAGE},
    "imageNote": ${t("imageNote")}
  },
  "venues": venues{
    "title": ${t("title")},
    "note": ${t("note")},
    "items": items[]{
      _key,
      "title": ${t("title")},
      "image": image${IMAGE},
      tall,
      "slug": caseStudy->{"s": coalesce(select($locale == "en" => slug.en.current), slug.ro.current), "p": hasPage != false}
    }
  },
  "services": services${TITLED},
  "testimonial": testimonial{ "eyebrow": ${t("eyebrow")}, "item": testimonial->${TESTIMONIAL} },
  ${SEO}
}`;

export const PROCESS_QUERY = `*[_id == "processPage"][0]{
  "hero": hero{
    "eyebrow": ${t("eyebrow")},
    "title": ${t("title")},
    "intro": ${t("intro")},
    "note": ${t("note")},
    "ctaLabel": ${t("ctaLabel")}
  },
  "steps": steps[]{ _key, "title": ${t("title")}, "text": ${t("text")}, "receive": receive${LINES} },
  "services": services${TITLED},
  "faq": faq{ "title": ${t("title")}, "items": items[]->${FAQ} },
  ${SEO}
}`;

export const STUDIO_QUERY = `*[_id == "studioPage"][0]{
  "hero": hero{
    "eyebrow": ${t("eyebrow")},
    "title": ${t("title")},
    "intro": ${t("intro")},
    "image": image${IMAGE},
    "since": ${t("since")}
  },
  "philosophy": philosophy{
    "eyebrow": ${t("eyebrow")},
    "title": ${t("title")},
    "intro": ${t("intro")},
    "principles": principles[]${TITLED}
  },
  "work": work{
    "title": ${t("title")},
    "images": images[]{ _key, tall, "image": image${IMAGE} },
    "ctaLabel": ${t("ctaLabel")}
  },
  "team": team{
    "eyebrow": ${t("eyebrow")},
    "title": ${t("title")},
    "members": members[]->{ _id, name, "role": ${t("role")}, "bio": ${t("bio")}, "portrait": portrait${IMAGE} }
  },
  ${SEO}
}`;

export const ON_SITE_QUERY = `*[_id == "onSitePage"][0]{
  "hero": hero{
    "eyebrow": ${t("eyebrow")},
    "title": ${t("title")},
    "intro": ${t("intro")},
    "ctaLabel": ${t("ctaLabel")},
    "image": image${IMAGE}
  },
  "visit": visit{ "title": ${t("title")}, "steps": steps[]${TITLED} },
  "faq": faq{ "title": ${t("title")}, "items": items[]->${FAQ} },
  ${SEO}
}`;

export const BOOK_QUERY = `*[_id == "bookPage"][0]{
  "hero": hero{
    "eyebrow": ${t("eyebrow")},
    "title": ${t("title")},
    "intro": ${t("intro")},
    "image": image${IMAGE}
  },
  "testimonials": testimonials[]->${TESTIMONIAL},
  "faq": faq{ "eyebrow": ${t("eyebrow")}, "title": ${t("title")}, "items": items[]->${FAQ} },
  ${SEO}
}`;

export const PRIVACY_QUERY = `*[_id == "privacyPage"][0]{
  "title": ${t("title")},
  updated,
  "sections": sections[]{ _key, "title": ${t("title")}, "anchor": anchor.current, "body": ${t("body")} },
  "note": ${t("note")},
  ${SEO}
}`;

/* ---------- Case studies ---------- */

/** Every case study with its own page, with both slugs (static params, sitemap, language switch). */
export const CASE_STUDY_SLUGS_QUERY = `*[_type == "caseStudy" && hasPage != false && defined(slug.ro.current)]{
  "ro": slug.ro.current,
  "en": coalesce(slug.en.current, slug.ro.current)
}`;

/** One case study by its slug in the current language. */
export const CASE_STUDY_QUERY = `*[_type == "caseStudy" && hasPage != false && coalesce(select($locale == "en" => slug.en.current), slug.ro.current) == $slug][0]{
  ${CARD_FIELDS},
  "slugs": { "ro": slug.ro.current, "en": coalesce(slug.en.current, slug.ro.current) },
  "lead": ${t("lead")},
  "hero": hero${IMAGE},
  "specs": specs[]{ "label": ${t("label")}, "value": ${t("value")} },
  "gallery": gallery[]{ _key, wide, "image": image${IMAGE} },
  "galleryNote": ${t("galleryNote")},
  "sections": sections[]{
    _key,
    _type,
    "intro": intro{ "eyebrow": ${t("eyebrow")}, "title": ${t("title")}, "text": ${t("text")} },
    "points": points${LINES},
    "sketch": sketch${IMAGE},
    "items": items[]{ "title": ${t("title")}, "text": ${t("text")}, value, "label": ${t("label")} },
    "eyebrow": ${t("eyebrow")},
    "testimonial": testimonial->${TESTIMONIAL}
  },
  "next": next->${CASE_STUDY_CARD},
  ${SEO}
}`;

/** Both slugs of the case study with this slug in either language (a link in the other language, or redirected by language detection). */
export const CASE_STUDY_ANY_SLUG_QUERY = `*[_type == "caseStudy" && hasPage != false && $slug in [slug.ro.current, slug.en.current]][0]{
  "ro": slug.ro.current,
  "en": coalesce(slug.en.current, slug.ro.current)
}`;
