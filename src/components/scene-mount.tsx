"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { updateBoot } from "@/lib/boot-script";
import { sceneEvents } from "@/lib/scene-state";

const GalaxyCanvas = dynamic(() => import("./galaxy/galaxy-canvas"), { ssr: false });

/** Loads the WebGL scene only in live mode, after the intro has had a head start. */
export function SceneMount() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const boot = window.__intellateBoot;
    if (!boot || boot.scene !== "live") return;
    const mount = () => setMounted(true);
    const delay = boot.intro === "play" ? 1800 : 0;
    const timer = window.setTimeout(mount, delay);
    document.addEventListener(sceneEvents.introEnd, mount);
    return () => {
      clearTimeout(timer);
      document.removeEventListener(sceneEvents.introEnd, mount);
    };
  }, []);

  const onFallback = useCallback((reason: string) => {
    updateBoot({ scene: "static", staticReason: "no-webgl" });
    setMounted(false);
    document.dispatchEvent(new CustomEvent(sceneEvents.sceneFallback, { detail: reason }));
  }, []);

  return mounted ? <GalaxyCanvas onFallback={onFallback} /> : null;
}
