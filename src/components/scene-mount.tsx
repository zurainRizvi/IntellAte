"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { updateBoot } from "@/lib/boot-script";
import { sceneEvents } from "@/lib/scene-state";

const GalaxyCanvas = dynamic(() => import("./galaxy/galaxy-canvas"), { ssr: false });

/** Loads the WebGL scene only in live mode. */
export function SceneMount() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const boot = window.__intellateBoot;
    if (!boot || boot.scene !== "live") return;
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const onFallback = useCallback((reason: string) => {
    updateBoot({ scene: "static", staticReason: "no-webgl" });
    setMounted(false);
    document.dispatchEvent(new CustomEvent(sceneEvents.sceneFallback, { detail: reason }));
  }, []);

  return mounted ? <GalaxyCanvas onFallback={onFallback} /> : null;
}
