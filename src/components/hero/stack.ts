import gsap from "gsap";

/**
 * Brings layer `index` of a stack to the front and animates it in over the
 * current one, then hides the layers underneath. Safe to call again before a
 * previous transition has finished.
 */
export function revealOnTop(
  layers: Element[],
  index: number,
  z: { current: number },
  from: gsap.TweenVars,
  to: gsap.TweenVars,
) {
  const el = layers[index];
  if (!el) return;
  const myZ = ++z.current;
  gsap.set(el, { zIndex: myZ });
  gsap.fromTo(el, { visibility: "visible", ...from }, {
    ...to,
    overwrite: true,
    onComplete: () => {
      layers.forEach((layer) => {
        if (layer !== el && Number(gsap.getProperty(layer, "zIndex")) < myZ) {
          gsap.set(layer, { autoAlpha: 0 });
        }
      });
    },
  });
}
