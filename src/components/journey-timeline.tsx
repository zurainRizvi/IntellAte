"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "@/config/motion";
import { sceneEvents, sceneState } from "@/lib/scene-state";

/**
 * The one scroll timeline: orbit progress, hero exit, branch growth and card
 * reveal. Values the render loop needs are tweened on `sceneState`; DOM
 * properties are owned here and nowhere else.
 */
export function JourneyTimeline() {
  useEffect(() => {
    if (window.__intellateBoot?.scene !== "live") return;
    gsap.registerPlugin(ScrollTrigger);
    const { heroOut, orbit, branch, card } = motion.timeline;
    const span = ([a, b]: readonly [number, number]) => b - a;

    let tl: gsap.core.Timeline | undefined;
    const ctx = gsap.context(() => {
      tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "#journey",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      tl.to(sceneState, { orbit: 1, duration: span(orbit) }, orbit[0])
        .to("[data-hero]", { autoAlpha: 0, y: -28, duration: span(heroOut) }, heroOut[0])
        .to("[data-scroll-hint]", { autoAlpha: 0, duration: 0.05 }, 0)
        .to(sceneState, { branch: 1, duration: span(branch) }, branch[0])
        .fromTo(
          "[data-card]",
          { autoAlpha: 0, y: 22, scale: 0.985 },
          { autoAlpha: 1, y: 0, scale: 1, duration: span(card), ease: "power2.out" },
          card[0],
        )
        .to({}, { duration: 1 - card[1] }, card[1]);
    });

    const revert = () => {
      ctx.revert();
      sceneState.orbit = 0;
      sceneState.branch = 0;
    };

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href="#work"]');
      const st = tl?.scrollTrigger;
      if (!link || !st || document.documentElement.dataset.scene !== "live") return;
      e.preventDefault();
      window.scrollTo({ top: st.start + (st.end - st.start) * 0.95, behavior: "smooth" });
      document.querySelector<HTMLElement>("[data-card]")?.focus({ preventScroll: true });
    };

    document.addEventListener("click", onClick);
    document.addEventListener(sceneEvents.sceneFallback, revert);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener(sceneEvents.sceneFallback, revert);
      revert();
    };
  }, []);

  return null;
}
