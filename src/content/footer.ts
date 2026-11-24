import { NAV, ROUTES } from "./site";

/**
 * Footer content. Contact details are the Paper design's placeholders;
 * replace them with the studio's real ones before launch.
 */
export const CONTACT = {
  email: "hello@celinestudio.ro",
  phone: "+40 745 123 456",
  address: "Str. Republicii 12, Oradea 410167, Romania",
};

/** The same links as the main nav (labels from messages, Nav.<key>). */
export const EXPLORE_LINKS = NAV;

/** Featured projects. Those without a page yet point at their category. */
export const FOOTER_PROJECTS = [
  { title: "Apartment, Oradea", tag: "RES", href: ROUTES.apartmentOradea },
  { title: "Street Coffee", tag: "HORECA", href: ROUTES.streetCoffee },
  { title: "Kitchen remodel", tag: "RES", href: ROUTES.residential },
  { title: "Private house", tag: "RES", href: ROUTES.residential },
];

export const LEGAL_LINKS = [
  { label: "Privacy policy", href: ROUTES.privacy },
  { label: "Instagram", external: "https://www.instagram.com/" },
];
