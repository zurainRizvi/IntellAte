"use client";

import { useEffect, useRef, useState } from "react";
import { introStorageKey, motion } from "@/config/motion";
import { updateBoot } from "@/lib/boot-script";
import { beginEntrance, sceneEvents, sceneState, type IntroOutcome } from "@/lib/scene-state";

type EndReason = "ended" | "user" | "autoplay-blocked" | "missing" | "slow";

const messages: Record<EndReason, string> = {
  ended: "Intro finished.",
  user: "Intro skipped.",
  "autoplay-blocked": "Intro could not autoplay and was skipped. Use Replay intro to watch it.",
  missing: "Intro video unavailable; showing the site directly.",
  slow: "Intro was taking too long to load and was skipped. Use Replay intro to try again.",
};

function pickSource() {
  const override = new URLSearchParams(location.search).get("introsrc");
  if (override === "missing") return "/media/intro-missing.mp4";
  // Prefer 1080 on desktop widths; 720 on phones to keep first paint light.
  return window.innerWidth >= 768 ? "/media/intro-1080.mp4" : "/media/intro-720.mp4";
}

/** Soft full-bleed fill of the same file; cache makes the second element free. */
function attachBleed(video: HTMLVideoElement, bleed: HTMLVideoElement) {
  bleed.muted = true;
  bleed.playsInline = true;
  const sync = () => {
    if (Math.abs(bleed.currentTime - video.currentTime) > 0.08) bleed.currentTime = video.currentTime;
  };
  const followPlay = () => void bleed.play().catch(() => {});
  const followPause = () => bleed.pause();
  bleed.src = video.currentSrc || video.src;
  bleed.currentTime = video.currentTime;
  followPlay();
  video.addEventListener("timeupdate", sync);
  video.addEventListener("seeked", sync);
  video.addEventListener("play", followPlay);
  video.addEventListener("pause", followPause);
  return () => {
    video.removeEventListener("timeupdate", sync);
    video.removeEventListener("seeked", sync);
    video.removeEventListener("play", followPlay);
    video.removeEventListener("pause", followPause);
    bleed.pause();
    bleed.removeAttribute("src");
    bleed.load();
  };
}

export function IntroOverlay() {
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bleedRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [run, setRun] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    window.__intellateIntroMounted = true;
    const onReplay = () => {
      window.scrollTo({ top: 0, behavior: "instant" });
      sceneState.entrance = null;
      updateBoot({ intro: "play" });
      setRun((r) => r + 1);
    };
    document.addEventListener(sceneEvents.introReplay, onReplay);
    return () => {
      window.__intellateIntroMounted = false;
      document.removeEventListener(sceneEvents.introReplay, onReplay);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const bleed = bleedRef.current;
    const layer = layerRef.current;
    if (!video || !bleed || !layer || window.__intellateBoot?.intro !== "play") return;

    let finished = false;
    let startTimeout = 0;
    let detachBleed: (() => void) | undefined;
    const timers: number[] = [];
    const teardownVideo = () => {
      detachBleed?.();
      detachBleed = undefined;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
    const finish = (outcome: IntroOutcome, reason: EndReason) => {
      if (finished) return;
      finished = true;
      clearTimeout(startTimeout);
      timers.forEach(clearTimeout);
      try {
        localStorage.setItem(introStorageKey, "1");
      } catch {}
      beginEntrance(outcome);
      const fade = outcome === "completed" ? motion.introCrossfadeMs : motion.introSkipFadeMs;
      layer.style.transition = `opacity ${fade}ms ease`;
      layer.style.opacity = "0";
      timers.push(
        window.setTimeout(() => {
          updateBoot({ intro: "done" });
          layer.style.transition = "";
          layer.style.opacity = "";
          teardownVideo();
        }, fade),
      );
      document.documentElement.dataset.introOutcome = reason;
      document.dispatchEvent(new CustomEvent(sceneEvents.introEnd, { detail: reason }));
      setStatus(messages[reason]);
    };
    skipRef.current = () => finish("skipped", "user");

    const onTime = () => {
      if (video.duration && video.currentTime >= video.duration - motion.introCrossfadeLead) finish("completed", "ended");
    };
    const onEnded = () => finish("completed", "ended");
    const onError = () => finish("skipped", "missing");
    const onPlaying = () => clearTimeout(startTimeout);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish("skipped", "user");
    const onVisibility = () => {
      if (document.hidden) video.pause();
      else if (!finished) video.play().catch(() => finish("skipped", "autoplay-blocked"));
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    video.addEventListener("playing", onPlaying, { once: true });
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);

    startTimeout = window.setTimeout(() => finish("skipped", "slow"), motion.introStartTimeoutMs);
    video.muted = true;
    video.src = pickSource();
    video.currentTime = 0;
    detachBleed = attachBleed(video, bleed);
    video.play().catch((err: unknown) => {
      if (!finished && !(err instanceof DOMException && err.name === "AbortError")) finish("skipped", "autoplay-blocked");
    });

    return () => {
      finished = true;
      clearTimeout(startTimeout);
      timers.forEach(clearTimeout);
      teardownVideo();
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [run]);

  return (
    <>
      <div ref={layerRef} className="intro-layer" aria-label="Intro film">
        <video
          ref={bleedRef}
          className="intro-video-bleed"
          muted
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="intro-frame">
          <video
            ref={videoRef}
            className="intro-video-frame"
            muted
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
        <button type="button" data-intro-skip className="intro-skip" onClick={() => skipRef.current()}>
          Skip intro
        </button>
      </div>
      <p className="sr-only" role="status">
        {status}
      </p>
    </>
  );
}
