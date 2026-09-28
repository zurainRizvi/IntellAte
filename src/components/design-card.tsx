'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Maximize2, Minimize2, X } from "lucide-react";
import type { Design } from "@/content/schema";
import { getSingleEventTheme } from "@/demos/single-events/themes";

type Props = {
  design: Design;
  index?: number;
};

export function DesignCard({ design, index }: Props) {
  const ordinal = index === undefined ? null : String(index + 1).padStart(2, "0");
  const theme = design.hasLivePreview ? getSingleEventTheme(design.slug) : undefined;
  const swatch = design.previewSwatch ?? (theme
    ? {
        bg: theme.colors.page,
        accent: theme.colors.accent,
        ink: theme.colors.ink,
        soft: theme.colors.accentSoft,
      }
    : null);

  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setMaximized(false);
    dialogRef.current?.close();
  }, []);

  const openPreview = () => {
    if (!design.hasLivePreview) return;
    setOpen(true);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      setMaximized(false);
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <article className="design-card">
        {design.flagship && <p className="draft-badge">Flagship demo</p>}
        {swatch && (
          <button
            type="button"
            className="design-thumb"
            onClick={design.hasLivePreview ? openPreview : undefined}
            disabled={!design.hasLivePreview}
            aria-label={
              design.hasLivePreview
                ? `Preview ${design.title} in phone frame`
                : `${design.title} preview coming soon`
            }
            style={
              {
                "--thumb-bg": swatch.bg,
                "--thumb-accent": swatch.accent,
                "--thumb-ink": swatch.ink,
                "--thumb-soft": swatch.soft,
              } as CSSProperties
            }
          >
            <span className="design-thumb-phone" aria-hidden="true">
              <span className="design-thumb-screen">
                <span className="design-thumb-curtain" />
                <span className="design-thumb-play" />
                <span className="design-thumb-names">
                  {theme?.names ?? design.title}
                </span>
                <span className="design-thumb-label">{design.eventLabels[0]}</span>
              </span>
            </span>
            {design.hasLivePreview && (
              <span className="design-thumb-hint">Tap to preview · maximize</span>
            )}
          </button>
        )}
        {ordinal && (
          <p className="eyebrow">
            {ordinal} / {design.eyebrow}
          </p>
        )}
        {!ordinal && <p className="eyebrow">{design.eyebrow}</p>}
        <h3 className="card-title">{design.title}</h3>
        <p className="card-summary">{design.summary}</p>
        <ul className="card-roles" aria-label="Design type">
          <li>{design.kind === "multi" ? "Multi-event" : "Single-event"}</li>
          <li>
            {design.eventCount === 1 ? "1 event" : `${design.eventCount} events`}
          </li>
          <li>{design.startingPrice}</li>
        </ul>
        <div className="hero-actions" style={{ marginTop: "1.25rem" }}>
          <Link href={`/invitations/${design.slug}`} className="btn btn-primary">
            View design
          </Link>
          {design.hasLivePreview && (
            <button type="button" className="btn btn-ghost" onClick={openPreview}>
              Live preview
            </button>
          )}
        </div>
      </article>

      {design.hasLivePreview && (
        <dialog
          ref={dialogRef}
          className={`preview-dialog${maximized ? " is-max" : ""}`}
          aria-labelledby={titleId}
        >
          <div className="preview-dialog-chrome">
            <p id={titleId} className="preview-dialog-title">
              {design.title}
            </p>
            <div className="preview-dialog-actions">
              <button
                type="button"
                className="preview-icon-btn"
                onClick={() => setMaximized((v) => !v)}
                aria-label={maximized ? "Exit maximized view" : "Maximize preview"}
              >
                {maximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <Link href={`/invitations/${design.slug}/preview`} className="preview-dialog-link">
                Open full page
              </Link>
              <Link href={`/order?design=${design.slug}`} className="preview-dialog-link">
                Request
              </Link>
              <button type="button" className="preview-icon-btn" onClick={close} aria-label="Close preview">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className={`preview-stage${maximized ? " is-max" : ""}`}>
            <div className={`preview-phone${maximized ? " is-max" : ""}`}>
              {open && (
                <iframe
                  title={`${design.title} live preview`}
                  src={`/invitations/${design.slug}/preview?embed=1`}
                  className="preview-iframe"
                />
              )}
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
