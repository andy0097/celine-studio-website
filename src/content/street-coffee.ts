import { ROUTES } from "./site";

/**
 * Case study: Street Coffee (Paper "Project · Street Coffee — A Editorial").
 * Placeholders: area, seats, all result numbers; gallery photos are Home
 * renders until the Street Coffee shoot.
 */
export const STREET_COFFEE = {
  breadcrumb: "Projects / HORECA / 01",
  title: ["Street", "Coffee"],
  lead: "A café reorganised around how fast the bar serves and how much every seat counts.",
  specs: [
    { label: "Type", value: "HORECA — Café" },
    { label: "Location", value: "Oradea, Bihor" },
    { label: "Area", value: "XX m²" },
    { label: "Seats", value: "XX at tables + bar" },
    { label: "Scope", value: "Full design + custom lighting" },
  ],
  hero: {
    src: "/images/custom-elements/lighting.png",
    alt: "Oval blackened-steel light fixture with inset LED strips over the Street Coffee bar",
    position: "50% 35%",
  },
  value: {
    eyebrow: "01 — Value for the business",
    title: "What design does for your business",
    text: "A venue isn’t judged only by how it looks, but by how it works on a full day.",
    items: [
      { title: "Seats placed on real flow", text: "Tables follow where guests queue and sit, so nobody blocks the staff route." },
      { title: "A bar built for peak hours", text: "Work zones short enough that orders move without anyone crossing paths." },
      { title: "Materials for daily traffic", text: "Finishes chosen to stay beautiful after thousands of cups — easy to clean, hard to mark." },
      { title: "Atmosphere by the hour", text: "Lighting scenes for the morning rush and the evening, so the room fits both." },
    ],
  },
  results: {
    eyebrow: "02 — Results",
    title: "What changed, in numbers",
    text: "What every owner tracks: how many seats, how the space is used, how long it takes to open.",
    items: [
      { value: "XX", label: "Seats at tables & bar" },
      { value: "XX m²", label: "Area designed" },
      { value: "+XX%", label: "Peak-hour serving capacity" },
      { value: "XX", label: "Weeks from briefing to handover" },
    ],
  },
  gallery: [
    { src: "/images/custom-elements/lighting.png", alt: "Placeholder: the custom oval fixture over the bar", position: "50% 30%", wide: true },
    { src: "/images/projects/kitchen.png", alt: "Placeholder: counter with an oak arch and fluted island", wide: false },
    { src: "/images/projects/dining.png", alt: "Placeholder: seating area with arched oak shelving", wide: false },
    { src: "/images/hero/living-room_sketch.png", alt: "Placeholder: line drawing of a seating area", wide: true },
  ],
  galleryNote: "Placeholder photos — replace with the Street Coffee shoot",
  testimonial: {
    eyebrow: "What the owner says",
    quote: "They asked us from the start how many seats we wanted and how service runs at peak hours. The whole project was built around those answers.",
    name: "Mihai Pop",
    initials: "MP",
    project: "Owner, Street Coffee — Oradea",
  },
  next: { label: "Apartment, Oradea", href: ROUTES.apartmentOradea },
};
