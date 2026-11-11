"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import "lenis/dist/lenis.css";

/**
 * Lenis smooth scrolling for the page that mounts it (the landing page).
 * Docs pages keep native scrolling because of their nested scroll areas.
 * Skipped when the visitor prefers reduced motion; destroyed on unmount so
 * client navigation hands back native scrolling.
 */
export const SmoothScroll = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const lenis = new Lenis({
      allowNestedScroll: true,
      anchors: true,
      autoRaf: true,
      lerp: 0.1,
      prevent: (node) => node.closest('[role="dialog"]') !== null,
    });
    // Radix locks native scrolling; stop Lenis too so wheel inertia cannot move the page.
    let readingPosition: number | null = null;
    let restoreFrame = 0;
    const syncLock = () => {
      if (document.body.hasAttribute("data-scroll-locked")) {
        readingPosition ??= window.scrollY;
        cancelAnimationFrame(restoreFrame);
        lenis.stop();
      } else {
        lenis.start();
        if (readingPosition !== null) {
          const position = readingPosition;
          readingPosition = null;
          restoreFrame = requestAnimationFrame(() => {
            lenis.scrollTo(position, { immediate: true, force: true });
          });
        }
      }
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-scroll-locked"] });
    syncLock();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(restoreFrame);
      lenis.destroy();
    };
  }, []);

  return null;
};
