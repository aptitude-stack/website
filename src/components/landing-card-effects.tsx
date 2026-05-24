"use client";

import { useEffect } from "react";

const CARD_SELECTOR = "[data-skew-card]";

export function LandingCardEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      return;
    }

    const cards = Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR));

    const handlePointerMove = (event: PointerEvent) => {
      const card = event.currentTarget;

      if (!(card instanceof HTMLElement)) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = ((x - centerX) / centerX) * 4.5;
      const rotateX = ((centerY - y) / centerY) * 4.5;

      card.style.setProperty("--skew-rotate-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--skew-rotate-y", `${rotateY.toFixed(2)}deg`);
      card.style.setProperty("--skew-x", `${x.toFixed(0)}px`);
      card.style.setProperty("--skew-y", `${y.toFixed(0)}px`);
    };

    const handlePointerLeave = (event: PointerEvent) => {
      const card = event.currentTarget;

      if (!(card instanceof HTMLElement)) {
        return;
      }

      card.style.removeProperty("--skew-rotate-x");
      card.style.removeProperty("--skew-rotate-y");
      card.style.removeProperty("--skew-x");
      card.style.removeProperty("--skew-y");
    };

    for (const card of cards) {
      card.addEventListener("pointermove", handlePointerMove);
      card.addEventListener("pointerleave", handlePointerLeave);
      card.addEventListener("pointercancel", handlePointerLeave);
    }

    return () => {
      for (const card of cards) {
        card.removeEventListener("pointermove", handlePointerMove);
        card.removeEventListener("pointerleave", handlePointerLeave);
        card.removeEventListener("pointercancel", handlePointerLeave);
      }
    };
  }, []);

  return null;
}
