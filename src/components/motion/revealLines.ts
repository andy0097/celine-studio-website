import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Display headline that rises in line by line from behind line masks,
 * scrubbed by `scrollTrigger`. Re-splits on resize. Call inside useGSAP so
 * it is cleaned up with the component.
 */
export function revealLines(el: Element, scrollTrigger: ScrollTrigger.Vars) {
  return SplitText.create(el, {
    type: "lines",
    mask: "lines",
    autoSplit: true,
    onSplit: (self) => {
      // Display line-heights (0.91) are tighter than the glyphs, so a plain
      // line mask clips descenders (g, p). Extend each mask down without
      // changing the line spacing.
      gsap.set(self.masks, { paddingBottom: "0.25em", marginBottom: "-0.25em" });
      return gsap.from(self.lines, {
        // Past 100% so the line clears the taller mask completely
        yPercent: 130,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger,
      });
    },
  });
}
