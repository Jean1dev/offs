"use client";

// LandingEffects — progressive enhancement for the public landing page.
// Mirrors the <script> in the design handoff (Landing.html): nav scroll shadow
// and reveal-on-scroll. Renders nothing; toggles scoped CSS-module classes
// (passed in as props) on elements already in the DOM.

import { useEffect } from "react";

interface Props {
  rootSelector: string;
  revealSelector: string;
  navId: string;
  revealInClass: string;
  revealAllClass: string;
  scrolledClass: string;
}

export function LandingEffects({
  rootSelector,
  revealSelector,
  navId,
  revealInClass,
  revealAllClass,
  scrolledClass,
}: Props) {
  useEffect(() => {
    const nav = document.getElementById(navId);
    const root = document.querySelector<HTMLElement>(rootSelector);
    const reveals = [...document.querySelectorAll<HTMLElement>(revealSelector)];

    // ── nav shadow on scroll ──
    const onScroll = () => nav?.classList.toggle(scrolledClass, window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── reveal on scroll ──
    reveals.forEach((el, i) => {
      el.style.animationDelay = `${(i % 4) * 70}ms`;
    });

    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add(revealInClass);
              observer?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
      );
      reveals.forEach((el) => observer?.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add(revealInClass));
    }

    // ── safety net: never leave content hidden, whatever the render context ──
    const timer = window.setTimeout(() => root?.classList.add(revealAllClass), 1600);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer?.disconnect();
      window.clearTimeout(timer);
    };
  }, [rootSelector, revealSelector, navId, revealInClass, revealAllClass, scrolledClass]);

  return null;
}
