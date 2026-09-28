'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { theme } from '@/demos/aurora-safar/config/theme';
import { Ornament } from '@/demos/aurora-safar/components/shared/Ornament';
import { Petals } from '@/demos/aurora-safar/components/shared/Petals';
import { Birds } from '@/demos/aurora-safar/components/intro/Birds';
import type { Locale } from '@/demos/aurora-safar/config/translations';
import { t } from '@/demos/aurora-safar/config/translations';

type Props = {
  locale: Locale;
  onBegin: () => void;
  /** Fired when the hero card is shown so content below can mount before SWIPE DOWN. */
  onHeroReady?: () => void;
};

type Phase = 'awaitingTap' | 'curtain' | 'hero';

/** Wall-clock overlay schedule (ms after tap) — independent of video buffering. */
const INVITE_IN_MS = 3000; // Mrs. Imran on the 3rd second
const INVITE_OUT_MS = 7000; // holds through the 7th second (+1s)
const HERO_IN_MS = 8000; // Ayaan & Zara on the 8th second

export default function OpeningStage({ locale, onBegin, onHeroReady }: Props) {
  const curtainRef = useRef<HTMLVideoElement>(null);
  const beganRef = useRef(false);
  const heroReadyRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const beginRef = useRef<() => void>(() => {});
  const unbindBeginRef = useRef<(() => void) | null>(null);

  const [phase, setPhase] = useState<Phase>('awaitingTap');
  const [showInvite, setShowInvite] = useState(false);
  const [showHeroCard, setShowHeroCard] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);

  const curtainSrc = `${theme.videos.opening}?v=${theme.videos.version}`;
  const posterSrc = `${theme.videos.openingPoster}?v=${theme.videos.version}`;

  const showTap = phase === 'awaitingTap';
  const showHero = showHeroCard || phase === 'hero';

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const revealHero = () => {
    setShowInvite(false);
    setShowHeroCard(true);
    if (!heroReadyRef.current) {
      heroReadyRef.current = true;
      onHeroReady?.();
    }
  };

  useEffect(() => () => {
    clearTimers();
    unbindBeginRef.current?.();
  }, []);

  const attachCurtain = useCallback((node: HTMLVideoElement | null) => {
    curtainRef.current = node;
    if (!node) return;
    // iOS ignores a muted video that only has the React prop; the DOM property
    // and playsinline attributes must exist before play().
    node.muted = true;
    node.defaultMuted = true;
    node.volume = 0;
    node.playsInline = true;
    node.setAttribute('muted', '');
    node.setAttribute('playsinline', '');
    node.setAttribute('webkit-playsinline', '');
  }, []);

  const playCurtainNow = () => {
    const video = curtainRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    // Must run in the tap turn. Awaiting metadata, seeking, or pausing first
    // drops iOS user activation, so play() is rejected and the curtain stays shut.
    const pending = video.play();
    void pending?.catch(() => {
      const retry = () => {
        video.muted = true;
        void video.play().catch(() => {});
      };
      video.addEventListener('canplay', retry, { once: true });
      video.addEventListener('loadeddata', retry, { once: true });
    });
  };

  const begin = () => {
    if (beganRef.current) return;
    beganRef.current = true;

    playCurtainNow();
    try {
      onBegin();
    } catch {
      // A failed music seek must not cancel the curtain.
    }
    setPhase('curtain');
    setShowInvite(false);
    setShowHeroCard(false);
    clearTimers();

    timersRef.current.push(
      window.setTimeout(() => setShowInvite(true), INVITE_IN_MS),
      window.setTimeout(() => setShowInvite(false), INVITE_OUT_MS),
      window.setTimeout(() => {
        revealHero();
      }, HERO_IN_MS),
    );
  };

  useEffect(() => {
    beginRef.current = begin;
  });

  const attachBeginButton = useCallback((node: HTMLButtonElement | null) => {
    unbindBeginRef.current?.();
    unbindBeginRef.current = null;
    if (!node) return;

    let startX = 0;
    let startY = 0;
    const onStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
    };
    const onEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      if (Math.hypot(touch.clientX - startX, touch.clientY - startY) > 18) return;
      // iOS in-app browsers only treat touchend as the media user-gesture.
      beginRef.current();
    };
    node.addEventListener('touchstart', onStart, { passive: true });
    node.addEventListener('touchend', onEnd);
    unbindBeginRef.current = () => {
      node.removeEventListener('touchstart', onStart);
      node.removeEventListener('touchend', onEnd);
    };
  }, []);

  const handleCurtainEnded = () => {
    revealHero();
    setPhase('hero');
  };

  return (
    <section
      className="opening-stage page-snap"
      style={{
        position: 'relative',
        width: '100%',
        background: '#1a0508',
        // Let swipe / wheel reach the scrolling <main>; the video must not capture them.
        touchAction: 'pan-y',
      }}
    >
      <video
        ref={attachCurtain}
        src={curtainSrc}
        poster={posterSrc}
        playsInline
        muted
        preload="auto"
        controls={false}
        disablePictureInPicture
        onPlay={() => setVideoStarted(true)}
        onPlaying={() => setVideoStarted(true)}
        onEnded={handleCurtainEnded}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {!videoStarted && (
        <img
          src={posterSrc}
          alt=""
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      <AnimatePresence>
        {showInvite && !showHero && (
          <motion.div
            key="invite"
            className="opening-invite-overlay"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="opening-invite-host">Mrs. Imran Malik</p>
            <p className="opening-invite-body">
              Cordially invites you to the Wedding Ceremony of her beloved Son.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTap && (
          <motion.div
            key="tap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.45 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 'max(72px, calc(env(safe-area-inset-bottom, 0px) + 11vh))',
              zIndex: 5,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <button
              ref={attachBeginButton}
              type="button"
              className="tap-begin"
              onClick={begin}
              style={{
                pointerEvents: 'auto',
                width: 'min(78%, 280px)',
                padding: '14px 22px',
                borderRadius: '999px',
                border: '1.5px solid rgba(212, 175, 87, 0.85)',
                background: 'rgba(16, 10, 12, 0.72)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.28em',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                WebkitTapHighlightColor: 'transparent',
                boxShadow: '0 10px 28px rgba(0,0,0,0.45)',
                touchAction: 'manipulation',
                minHeight: 48,
              }}
            >
              TAP TO BEGIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHero && (
          <motion.div
            key="sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}
          >
            <Petals tone="red-white" amount={28} />
            <Birds />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHero && (
          <motion.div
            key="hero"
            initial={{ y: 80 }}
            animate={{ y: 0 }}
            transition={{ duration: 1.25, ease: [0.22, 0.82, 0.28, 1] }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 'max(88px, calc(env(safe-area-inset-bottom, 0px) + 14vh))',
              zIndex: 5,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '0 22px',
              pointerEvents: 'none',
            }}
          >
            {/*
              Glass stays opacity 1 always — never fade opacity on backdrop-filter
              (that causes the clear→blur glitch). Slide uses transform only.
            */}
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                background: theme.colors.creamGlass,
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                isolation: 'isolate',
                opacity: 1,
                border: `1px solid ${theme.colors.goldLine}`,
                borderRadius: '24px',
                padding: '28px 22px 24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                textAlign: 'center',
                color: theme.colors.ink,
                transform: 'translateZ(0)',
              }}
            >
              <p
                className="eyebrow"
                style={{
                  color: theme.colors.gold,
                  marginBottom: 10,
                  letterSpacing: '0.28em',
                  fontSize: 11,
                }}
              >
                {t(locale, 'families')}
              </p>
              <h1
                style={{
                  margin: '4px 0 14px',
                  color: theme.colors.ink,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 500,
                  fontSize: 'clamp(40px, 11vw, 52px)',
                  lineHeight: 1.05,
                }}
              >
                <motion.em
                  style={{ fontStyle: 'italic', display: 'inline-block' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.55 }}
                >
                  Ayaan
                </motion.em>
                <motion.b
                  style={{ color: theme.colors.gold, fontWeight: 500, margin: '0 10px', display: 'inline-block' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  &
                </motion.b>
                <motion.em
                  style={{ fontStyle: 'italic', display: 'inline-block' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.55 }}
                >
                  Zara
                </motion.em>
              </h1>
              <Ornament />
              <p
                style={{
                  margin: '10px 0 0',
                  color: theme.colors.inkSoft,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  letterSpacing: '0.04em',
                }}
              >
                {locale === 'ur' ? 'شادی کر رہے ہیں' : 'Are Getting Married'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHero && (
          <motion.div
            key="scroll-hint"
            className="scroll-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            aria-hidden
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 'max(18px, calc(env(safe-area-inset-bottom, 0px) + 10px))',
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              pointerEvents: 'none',
            }}
          >
            <span className="scroll-hint-label">
              {locale === 'ur' ? 'نیچے سوائپ کریں' : 'SWIPE DOWN'}
            </span>
            <span className="scroll-hint-chevron" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
