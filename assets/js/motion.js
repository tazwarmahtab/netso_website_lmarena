/* Netso Motion layer
   Powered by Motion (formerly Framer Motion), using the official browser API.
   Progressive enhancement only. GSAP remains responsible for the existing
   cinematic scroll/video system. Motion owns tactile UI, in-view sequencing,
   and small scroll-linked transforms so the two systems do not fight. */
import {
  animate,
  inView,
  hover,
  scroll,
  spring,
  transform
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

  // Motion owns the commercial narrative cards. These are intentionally
  // separate from the existing GSAP reveal selectors.
  reveal(".v2-flow > div", { stagger: 0.07 });
  reveal(".v2-underwrite > div", { stagger: 0.055 });
  reveal(".v2-lifecycle__grid li", { stagger: 0.045 });
  reveal(".v2-architecture > div", { stagger: 0.07 });

  // Tactile industrial UI. Springs make the interaction feel physical without
  // introducing a large visual effect or layout shift.
  const cardSelectors = [
    ".v2-flow > div",
    ".v2-underwrite > div",
    ".v2-lifecycle__grid li",
    ".v2-architecture > div",
    ".v2-cards .card"
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

  // Scroll-linked hero grid drift. Motion's scroll pipeline handles the value
  // without forcing React-style renders because this is a static site.
  const heroGrid = document.querySelector(".v2-hero__grid");
  if (heroGrid) {
    scroll(
      animate(
        heroGrid,
        { y: ["0%", "12%"] },
        { ease: "linear" }
      ),
      { target: document.querySelector(".v2-hero") }
    );
  }

  // Scroll progress is deliberately separate from the existing GSAP rail so
  // there is a single visible indicator, not two competing UI treatments.
  const progress = document.querySelector(".scroll-progress span");
  if (progress) {
    scroll(animate(progress, { scaleX: [0, 1] }, { ease: "linear" }));
  }

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
