'use client';

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import type { SingleEventTheme } from "./types";

function useCountdown(targetIso: string) {
  const target = useMemo(() => new Date(targetIso).getTime(), [targetIso]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, done: diff <= 0 };
}

export default function SingleEventInvitation({ theme }: { theme: SingleEventTheme }) {
  const [opened, setOpened] = useState(false);
  const [response, setResponse] = useState<"yes" | "no" | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const countdown = useCountdown(theme.targetDate);
  const c = theme.colors;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!response || !name.trim()) return;
    setSubmitted(true);
  };

  const cssVars = {
    "--sei-page": c.page,
    "--sei-page-deep": c.pageDeep,
    "--sei-card": c.card,
    "--sei-ink": c.ink,
    "--sei-ink-soft": c.inkSoft,
    "--sei-muted": c.muted,
    "--sei-accent": c.accent,
    "--sei-accent-soft": c.accentSoft,
    "--sei-wash": c.wash,
    "--sei-curtain": c.curtain,
  } as CSSProperties;

  return (
    <div className="sei-root" style={cssVars}>
      {!opened ? (
        <button type="button" className="sei-gate" onClick={() => setOpened(true)} aria-label={theme.tapHint}>
          <span className="sei-gate-curtain" aria-hidden="true" />
          <span className="sei-gate-bloom" aria-hidden="true" />
          <span className="sei-gate-play" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13l11-6.5L8 5.5z" />
            </svg>
          </span>
          <span className="sei-gate-hint">{theme.tapHint}</span>
          <span className="sei-gate-title">{theme.title}</span>
        </button>
      ) : (
        <main className="sei-main" aria-label={`${theme.title} invitation`}>
          <section className="sei-page sei-hero">
            <p className="sei-eyebrow">{theme.occasionLabel}</p>
            <h1 className="sei-names">{theme.names}</h1>
            <p className="sei-host">{theme.hostLine}</p>
            <div className="sei-ornament" aria-hidden="true" />
            <p className="sei-message">{theme.message}</p>
          </section>

          <section className="sei-page sei-details">
            <article className="sei-card">
              <p className="sei-label">When</p>
              <p className="sei-value">{theme.dateLabel}</p>
              <p className="sei-sub">{theme.timeLabel}</p>
              <p className="sei-label" style={{ marginTop: "1.25rem" }}>
                Where
              </p>
              <p className="sei-value">{theme.venue}</p>
              <p className="sei-sub">{theme.city}</p>
            </article>
          </section>

          <section className="sei-page sei-countdown" aria-live="polite">
            <p className="sei-eyebrow">{theme.countdownLabel}</p>
            {countdown.done ? (
              <p className="sei-names" style={{ fontSize: "clamp(1.6rem, 6vw, 2.2rem)" }}>
                It&apos;s today
              </p>
            ) : (
              <div className="sei-count-grid">
                {(
                  [
                    ["Days", countdown.days],
                    ["Hours", countdown.hours],
                    ["Mins", countdown.minutes],
                    ["Secs", countdown.seconds],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="sei-count-cell">
                    <span className="sei-count-num">{String(value).padStart(2, "0")}</span>
                    <span className="sei-count-label">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="sei-page sei-rsvp">
            <article className="sei-card">
              <h2 className="sei-rsvp-title">{theme.rsvpTitle}</h2>
              {submitted ? (
                <p className="sei-message" style={{ marginTop: "1rem" }}>
                  Thank you{name.trim() ? `, ${name.trim()}` : ""}. Your reply is noted for this demo.
                </p>
              ) : (
                <form className="sei-form" onSubmit={onSubmit}>
                  <div className="sei-choice" role="group" aria-label="Attendance">
                    <button
                      type="button"
                      className={`sei-choice-btn${response === "yes" ? " is-active" : ""}`}
                      onClick={() => setResponse("yes")}
                    >
                      Joyfully yes
                    </button>
                    <button
                      type="button"
                      className={`sei-choice-btn${response === "no" ? " is-active" : ""}`}
                      onClick={() => setResponse("no")}
                    >
                      With regret, no
                    </button>
                  </div>
                  <label className="sei-field">
                    <span>Your name</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                  </label>
                  <label className="sei-field">
                    <span>A short note (optional)</span>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                  </label>
                  <button type="submit" className="sei-submit" disabled={!response}>
                    Send RSVP
                  </button>
                </form>
              )}
            </article>
          </section>

          <section className="sei-page sei-farewell">
            <p className="sei-eyebrow">With warmth</p>
            <p className="sei-farewell-copy">{theme.farewell}</p>
            <p className="sei-host" style={{ marginTop: "1.5rem" }}>
              {theme.names}
            </p>
          </section>
        </main>
      )}
    </div>
  );
}
