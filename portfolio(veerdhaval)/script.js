/* ============================================================
   VEERDHAVAL JAGTAP — PORTFOLIO
   Motion logic: load-in sequence, scroll reveals, nav state,
   and the animated circuit ("skill schematic") diagram.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Registration marks fade-in on load ---------- */
  ["reg1", "reg2", "reg3", "reg4"].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    setTimeout(() => el.classList.add("show"), reduceMotion ? 0 : 200 + i * 120);
  });

  /* ---------- Nav shrink on scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-triggered reveals ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Circuit diagram: draw traces + light nodes ---------- */
  const traces = document.querySelectorAll(".circuit-trace");

  traces.forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = reduceMotion ? 0 : length;
  });

  let circuitPlayed = false;
  const circuitWrap = document.getElementById("circuit-wrap");

  const playCircuit = () => {
    if (circuitPlayed) return;
    circuitPlayed = true;

    traces.forEach((path, i) => {
      const length = path.getTotalLength();
      const delay = reduceMotion ? 0 : i * 160;
      const duration = reduceMotion ? 1 : 900;

      setTimeout(() => {
        path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.2,.7,.2,1)`;
        path.style.strokeDashoffset = "0";

        // light up the connected node once its trace lands
        const nodeId = path.getAttribute("data-node");
        const node = document.getElementById(nodeId);
        setTimeout(() => {
          if (node) node.classList.add("lit");
        }, duration * 0.9);
      }, delay);
    });

    // light the core after all traces arrive
    const core = document.querySelector(".circuit-core");
    setTimeout(() => {
      if (core) {
        core.querySelector("circle").style.transition = "filter 0.4s ease";
        core.querySelector("circle").style.filter = "drop-shadow(0 0 6px rgba(242,169,60,0.9))";
      }
    }, traces.length * 160 + 900);
  };

  if (circuitWrap) {
    const circuitObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playCircuit();
            circuitObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    circuitObserver.observe(circuitWrap);
  }

  /* ---------- Smooth in-page nav ---------- */
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    });
  });
});
