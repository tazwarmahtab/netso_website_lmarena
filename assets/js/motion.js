/* Netso Motion layer
   Powered by Motion (formerly Framer Motion), using the official browser API.
   Progressive enhancement only. GSAP remains responsible for the existing
   cinematic scroll/video system. Motion owns tactile UI, in-view sequencing,
   and small scroll-linked transforms so the two systems do not fight. */
import {
  animate,
  inView,
  hover,
  scroll
} from "https://cdn.jsdelivr.net/npm/motion@13.5.0/+esm";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduce) {
  document.documentElement.dataset.motion = "reduced";
} else {
  document.documentElement.dataset.motion = "motion";

  const reveal = (selector, options = {}) => {
    const nodes = [...document.querySelectorAll(selector)];
    if (!nodes.length) return;

    nodes.forEach((node, index) => {
      node.style.opacity = "0";
      node.style.transform = "translateY(24px)";
      inView(node, () => {
        animate(
          node,
          { opacity: 1, transform: "translateY(0px)" },
          {
            duration: options.duration ?? 0.7,
            delay: Math.min(index * (options.stagger ?? 0.055), 0.45),
            ease: [0.16, 1, 0.3, 1]
          }
        );
      }, { amount: options.amount ?? 0.2, once: true });
    });
  };

  // Keep Motion's in-view ownership on elements that GSAP does not already
  // animate. This avoids competing transform writers.
  reveal(".v2-economics__metrics > div", { stagger: 0.07, amount: 0.35 });

  // Tactile industrial UI. Springs make the interaction feel physical without
  // introducing a large visual effect or layout shift.
  const cardSelectors = [
    ".v2-economics__metrics > div",
    ".v2-architecture__core"
  ];

  cardSelectors.forEach((selector) => {
    hover(selector, (element) => {
      const controls = animate(
        element,
        { y: -4, scale: 1.008 },
        { type: "spring", stiffness: 420, damping: 30, mass: 0.55 }
      );
      return () => controls.stop();
    });
  });

  document.querySelectorAll(".btn").forEach((button) => {
    hover(button, (element) => {
      const controls = animate(
        element,
        { scale: 1.025, x: 2 },
        { type: "spring", stiffness: 520, damping: 28, mass: 0.5 }
      );
      return () => controls.stop();
    });

    button.addEventListener("pointerdown", () => {
      animate(
        button,
        { scale: 0.965 },
        { type: "spring", stiffness: 700, damping: 26, mass: 0.35 }
      );
    }, { passive: true });
  });

  // Header links get a restrained spring nudge on desktop pointers.
  document.querySelectorAll(".header__nav a").forEach((link) => {
    hover(link, (element) => {
      const controls = animate(
        element,
        { x: 3 },
        { type: "spring", stiffness: 500, damping: 30, mass: 0.45 }
      );
      return () => controls.stop();
    });
  });

  // High-value CTA affordance: the arrow travels independently, so the label
  // stays optically stable while the interaction communicates direction.
  document.querySelectorAll(".btn").forEach((button) => {
    const arrow = button.querySelector(".arrow, [aria-hidden='true']");
    if (!arrow) return;
    hover(button, () => {
      const controls = animate(
        arrow,
        { x: 5 },
        { type: "spring", stiffness: 520, damping: 24, mass: 0.4 }
      );
      return () => controls.stop();
    });
  });

  // Horizontal story rail. Motion owns the progress indicator only, while the
  // content remains native scroll for touch and accessibility.
  document.querySelectorAll("[data-motion-rail]").forEach((rail) => {
    const bar = rail.querySelector("[data-motion-rail-progress]");
    if (!bar) return;
    scroll(
      animate(bar, { scaleX: [0, 1] }, { ease: "linear" }),
      { target: rail }
    );
  });

  // Smoothly interpolate the screening output headline when the calculator
  // changes, instead of snapping between capacity values.
  const capacity = document.querySelector("[data-econ-capacity]");
  if (capacity) {
    let current = Number.parseFloat(capacity.textContent) || 0;
    const observer = new MutationObserver(() => {
      const next = Number.parseFloat(capacity.textContent) || 0;
      if (!Number.isFinite(next) || Math.abs(next - current) < 0.5) return;
      const from = current;
      current = next;
      const state = { value: from };
      animate(state, { value: next }, {
        type: "spring",
        stiffness: 170,
        damping: 24,
        onUpdate: (latest) => {
          capacity.textContent = `${Math.round(latest.value).toLocaleString("en-BD")} kWp`;
        }
      });
    });
    observer.observe(capacity, { childList: true, characterData: true, subtree: true });
  }
}
