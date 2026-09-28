'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Map, MapPin } from 'lucide-react';
import { wedding, type EventId, type WeddingEvent } from '@/demos/aurora-safar/config/wedding';
import { theme } from '@/demos/aurora-safar/config/theme';
import { t, type Locale } from '@/demos/aurora-safar/config/translations';
import { Card, Ornament } from '@/demos/aurora-safar/components/shared/Ornament';
import { Petals } from '@/demos/aurora-safar/components/shared/Petals';
import { ScheduleBow, TopCanopyArch } from '@/demos/aurora-safar/components/events/Botanicals';
import { schedulesData } from '@/demos/aurora-safar/components/events/schedulesData';
import { addEventToNativeCalendar } from '@/demos/aurora-safar/utils/calendar';

/** Play each event intro at most once per page load. */
const playedEventIntros = new Set<EventId>();

function mediaUrl(path: string) {
  return `${path}?v=${theme.videos.version}`;
}

export function Blessing({ locale }: { locale: Locale }) {
  const isRtl = locale === 'ur';
  return (
    <Card
      className="ivory blessing"
      style={{
        background: theme.colors.card,
        color: theme.colors.ink,
        borderTop: `1px solid ${theme.colors.goldLine}`,
        padding: '56px 26px',
      }}
    >
      <Petals tone="red-white" amount={22} />
      <p className="eyebrow" style={{ color: theme.colors.gold, letterSpacing: isRtl ? '0.1em' : undefined }}>
        {isRtl ? 'اللہ کے نام سے' : 'IN THE NAME OF ALLAH'}
      </p>
      <p className="arabic" style={{ color: theme.colors.ink, margin: '12px 0', fontSize: 28, lineHeight: 1.9, fontFamily: "'Amiri', serif" }}>
        {wedding.invitation.arabic}
      </p>
      <Ornament />
      <h2 style={{ color: theme.colors.ink, margin: '14px 0 10px', fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif", lineHeight: isRtl ? 1.65 : undefined }}>
        {isRtl ? 'محبت سے آغاز' : 'With love, we begin.'}
      </h2>
      <p className="copy" style={{ color: theme.colors.inkSoft, maxWidth: 330, margin: '0 auto', fontSize: isRtl ? 16 : 17, lineHeight: isRtl ? 1.9 : 1.7, fontFamily: isRtl ? "'Amiri', serif" : undefined }}>
        {isRtl
          ? 'اللہ کے نام سے ہم ایک حسین سفر کا آغاز کرتے ہیں اور آپ کو اس لمحے میں شریک ہونے کی دعوت دیتے ہیں۔'
          : 'In the name of Allah, we begin a beautiful journey and invite you to share this precious moment with us.'}
      </p>
      <blockquote
        dir="rtl"
        lang="ar"
        style={{
          marginTop: 28,
          fontFamily: "'Amiri', serif",
          fontSize: isRtl ? 22 : 20,
          lineHeight: 2.05,
          color: theme.colors.ink,
          maxWidth: 340,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {wedding.invitation.verseArabic}
      </blockquote>
      <p
        dir={isRtl ? 'rtl' : 'ltr'}
        lang={isRtl ? 'ur' : 'en'}
        style={{
          margin: '12px auto 0',
          maxWidth: 340,
          color: theme.colors.inkSoft,
          fontSize: isRtl ? 16 : 15,
          lineHeight: isRtl ? 1.95 : 1.7,
          fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
          fontStyle: isRtl ? 'normal' : 'italic',
          textAlign: 'center',
          overflowWrap: 'break-word',
          wordBreak: 'normal',
        }}
      >
        {isRtl ? wedding.invitation.verseMeaningUr : wedding.invitation.verseMeaningEn}
      </p>
      <small
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{
          display: 'block',
          marginTop: 12,
          color: theme.colors.muted,
          letterSpacing: isRtl ? '0.04em' : '0.12em',
          fontSize: isRtl ? 12 : 10,
          fontFamily: isRtl ? "'Amiri', serif" : undefined,
          lineHeight: isRtl ? 1.7 : undefined,
        }}
      >
        {isRtl ? wedding.invitation.verseReferenceUr : wedding.invitation.verseReferenceEn}
      </small>
    </Card>
  );
}

export function Countdown({ locale }: { locale: Locale }) {
  const [left, setLeft] = useState(0);
  const isRtl = locale === 'ur';
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, new Date(wedding.countdownTarget).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const labels = isRtl ? ['دن', 'گھنٹے', 'منٹ', 'سیکنڈ'] : ['DAYS', 'HOURS', 'MINUTES', 'SECONDS'];
  const v = [
    Math.floor(left / 86400000),
    Math.floor(left / 3600000) % 24,
    Math.floor(left / 60000) % 60,
    Math.floor(left / 1000) % 60,
  ];
  // Same gray as the illustration sky, so type sits in the open center.
  const backdrop = '#E4E5E0';
  const accent = theme.colors.blush;

  return (
    <Card
      className="count-card"
      style={{
        backgroundColor: backdrop,
        backgroundImage: 'url(/demos/aurora-safar/images/countdown-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        color: theme.colors.ink,
        borderTop: `1px solid ${theme.colors.blushLine}`,
        padding: '0',
        overflow: 'hidden',
      }}
    >
      <Petals tone="blush-mix" amount={20} />
      <div
        className="count-overlay"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: isRtl ? 'clamp(78px, 15vh, 124px) 22px 18px' : 'clamp(84px, 14.5vh, 128px) 26px 18px',
        }}
      >
        <p
          className="eyebrow"
          style={{
            color: accent,
            letterSpacing: isRtl ? '0.12em' : '0.28em',
            marginBottom: 8,
          }}
        >
          {isRtl ? 'ابدیت تک' : 'UNTIL FOREVER BEGINS'}
        </p>
        <h2
          style={{
            color: theme.colors.ink,
            margin: '6px 0 12px',
            fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
            fontSize: isRtl ? 'clamp(26px, 7vw, 34px)' : undefined,
            lineHeight: isRtl ? 1.65 : 1.15,
          }}
        >
          {isRtl ? 'دن گن رہے ہیں۔' : 'Counting the days.'}
        </h2>
        <Ornament color={accent} />
        <div
          className="count-grid count-grid-merged"
          style={{
            marginTop: 4,
            width: '100%',
            maxWidth: 340,
            background: 'transparent',
          }}
        >
          {v.map((n, i) => (
            <span key={i}>
              <strong style={{ color: accent, fontVariantNumeric: 'tabular-nums' }}>{String(n).padStart(2, '0')}</strong>
              <small style={{ color: theme.colors.muted, letterSpacing: isRtl ? '0.04em' : '0.16em' }}>{labels[i]}</small>
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function EventCard({ e, i, locale }: { e: WeddingEvent; i: number; locale: Locale }) {
  const isRtl = locale === 'ur';
  const n = { mehndi: ['Mehndi', 'مہندی'], baraat: ['Baraat', 'بارات'], waleema: ['Waleema', 'ولیمہ'] }[e.id];
  const s = {
    mehndi: ['an evening of colour', 'رنگوں بھری شام'],
    baraat: ['the royal celebration', 'شاہانہ تقریب'],
    waleema: ['a moonlit gathering', 'چاندنی محفل'],
  }[e.id];
  const date = new Date(e.date + 'T12:00:00');
  const dayName =
    locale === 'ur'
      ? ({ Tuesday: 'منگل', Wednesday: 'بدھ', Thursday: 'جمعرات', Friday: 'جمعہ' } as const)[e.day as 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday']
      : e.day;
  const timeLabel = isRtl ? 'شام ۷:۰۰ – ۱۰:۰۰' : e.time;
  const monthLabel = isRtl
    ? date.toLocaleString('ur-PK', { month: 'long' })
    : date.toLocaleString('en-GB', { month: 'long' }).toUpperCase();
  const ev = theme.events[e.id];
  const freezeLast = ev.freezeLastFrame;
  const trimStart = ev.trimStart ?? 0;
  const zoomFrom = ev.zoomFrom ?? 1;
  const zoomTo = ev.zoomTo ?? 1;
  const hasZoom = zoomFrom !== 1 || zoomTo !== 1;
  const videoSrc = mediaUrl(ev.video) + (trimStart > 0 ? `#t=${trimStart}` : '');
  const posterSrc = mediaUrl(ev.poster);
  const TEXT_AT = 2.3;

  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const failSafeRef = useRef<number | null>(null);
  const textTimerRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const finishedRef = useRef(playedEventIntros.has(e.id));
  const textRevealedRef = useRef(playedEventIntros.has(e.id));

  const [showText, setShowText] = useState(() => {
    if (playedEventIntros.has(e.id)) return true;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      playedEventIntros.add(e.id);
      return true;
    }
    return false;
  });
  const [panelIn, setPanelIn] = useState(() => playedEventIntros.has(e.id));
  const [videoDone, setVideoDone] = useState(() => playedEventIntros.has(e.id));
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomSecs, setZoomSecs] = useState(0);
  // Always keep the video mounted so the last frame can stay as the page background.
  const keepVideo = true;

  // Slide glass up from bottom without touching opacity (keeps blur stable).
  useEffect(() => {
    if (!showText) return;
    let cancelled = false;
    const start = window.setTimeout(() => {
      if (cancelled) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setPanelIn(true);
        return;
      }
      setPanelIn(false);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (!cancelled) setPanelIn(true);
        });
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [showText]);

  const revealText = () => {
    if (textRevealedRef.current) return;
    textRevealedRef.current = true;
    playedEventIntros.add(e.id);
    setShowText(true);
  };

  const parkOnLastFrame = (video: HTMLVideoElement) => {
    // Seeking on a natural `ended` can flash/stutter — only park when we must.
    try {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        const endAt = Math.max(trimStart, video.duration - 0.08);
        if (Math.abs(video.currentTime - endAt) > 0.12) {
          video.currentTime = endAt;
        }
      }
    } catch {
      // ignore seek errors
    }
    video.pause();
  };

  const finishVideo = (fromNaturalEnd = false) => {
    if (finishedRef.current && fromNaturalEnd) {
      const video = videoRef.current;
      if (video) video.pause();
      return;
    }
    finishedRef.current = true;
    if (failSafeRef.current != null) {
      window.clearTimeout(failSafeRef.current);
      failSafeRef.current = null;
    }
    if (textTimerRef.current != null) {
      window.clearTimeout(textTimerRef.current);
      textTimerRef.current = null;
    }
    revealText();
    setVideoDone(true);
    setZoomActive(false);
    const video = videoRef.current;
    if (!video) return;
    if (freezeLast) {
      if (fromNaturalEnd) {
        // Hold the decoded last frame — do not re-seek (avoids Baraat glitches).
        video.pause();
      } else {
        parkOnLastFrame(video);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Revisit: skip intro and park on the last frame as the background.
    if (playedEventIntros.has(e.id) && freezeLast) {
      const park = () => parkOnLastFrame(video);
      if (video.readyState >= 1) park();
      else video.addEventListener('loadedmetadata', park, { once: true });
      return;
    }
  }, [e.id, freezeLast, trimStart]);

  useEffect(() => {
    if (showText && videoDone) return;
    if (playedEventIntros.has(e.id) && showText) return;

    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    const clearTimers = () => {
      if (failSafeRef.current != null) {
        window.clearTimeout(failSafeRef.current);
        failSafeRef.current = null;
      }
      if (textTimerRef.current != null) {
        window.clearTimeout(textTimerRef.current);
        textTimerRef.current = null;
      }
    };

    const onTimeUpdate = () => {
      if (video.currentTime - trimStart >= TEXT_AT) revealText();
    };

    const onEnded = () => finishVideo(true);

    const startZoom = () => {
      if (!hasZoom) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setZoomSecs(0);
        setZoomActive(true);
        return;
      }
      const remaining =
        Number.isFinite(video.duration) && video.duration > video.currentTime
          ? Math.max(0.35, video.duration - video.currentTime)
          : 4.5;
      setZoomSecs(remaining);
      // Double-rAF so the browser commits zoomFrom before transitioning to zoomTo.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setZoomActive(true));
      });
    };

    const beginPlayback = () => {
      textTimerRef.current = window.setTimeout(() => revealText(), Math.round(TEXT_AT * 1000));
      const playWindowMs =
        Number.isFinite(video.duration) && video.duration > trimStart
          ? Math.round((video.duration - trimStart + 1.25) * 1000)
          : 10000;
      failSafeRef.current = window.setTimeout(() => finishVideo(false), playWindowMs);

      startZoom();
      const pending = video.play();
      void pending?.catch(() => {
        revealText();
        finishVideo(false);
      });
    };

    const tryPlay = () => {
      if (startedRef.current || finishedRef.current || (playedEventIntros.has(e.id) && showText)) return;
      startedRef.current = true;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');

      const kickoff = () => {
        if (trimStart <= 0) {
          beginPlayback();
          return;
        }
        // Seek first, then play — avoids the 0→trim jump stutter on Baraat.
        let started = false;
        const afterSeek = () => {
          if (started) return;
          started = true;
          video.removeEventListener('seeked', afterSeek);
          beginPlayback();
        };
        video.addEventListener('seeked', afterSeek);
        try {
          video.currentTime = trimStart;
        } catch {
          afterSeek();
          return;
        }
        // If already parked near trimStart, seeked may not fire.
        window.setTimeout(afterSeek, 280);
      };

      if (video.readyState >= 1) kickoff();
      else video.addEventListener('loadedmetadata', kickoff, { once: true });
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    const onError = () => finishVideo(false);
    video.addEventListener('error', onError);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.intersectionRatio >= 0.85) tryPlay();
      },
      { threshold: [0, 0.5, 0.85] }
    );

    observer.observe(root);
    return () => {
      observer.disconnect();
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount once per event card
  }, [e.id]);

  const mediaScale = !hasZoom ? 1 : videoDone || zoomActive ? zoomTo : zoomFrom;
  const mediaTransition =
    hasZoom && zoomActive && zoomSecs > 0 && !videoDone
      ? `transform ${zoomSecs}s linear`
      : 'none';

  return (
    <Card
      className={`event ${e.id}`}
      style={{
        backgroundColor: e.id === 'mehndi' ? '#FDF8E7' : e.id === 'baraat' ? '#2A080C' : '#0A1F24',
        borderTop: `1px solid ${ev.border}`,
        borderBottom: `1px solid ${ev.border}`,
        color: ev.cardInk,
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
        // Keep vertical swipe on the invitation scroller — never pinch/page-zoom.
        touchAction: 'pan-y',
      }}
    >
      <div ref={rootRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden />

      {keepVideo && (
        <div
          aria-hidden
          className="event-media-stage"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            overflow: 'hidden',
            pointerEvents: 'none',
            touchAction: 'pan-y',
          }}
        >
          {/*
            Zoom only the picture frame inside a clipped stage.
            Never scale the <video> node or the browser viewport.
          */}
          <div
            className="event-media-frame"
            style={{
              position: 'absolute',
              inset: 0,
              transform: `scale(${mediaScale})`,
              transformOrigin: 'center center',
              transition: mediaTransition,
              pointerEvents: 'none',
            }}
          >
            <img
              src={posterSrc}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: e.id === 'waleema' ? 'center center' : 'center top',
                pointerEvents: 'none',
              }}
            />
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              playsInline
              muted
              preload="auto"
              controls={false}
              disablePictureInPicture
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: e.id === 'waleema' ? 'center center' : 'center top',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      )}

      {showText && (
        <>
          {/* Soft center vignette — illustration stays visible */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              background:
                e.id === 'mehndi'
                  ? 'radial-gradient(ellipse at center, rgba(255,250,240,0.18) 0%, transparent 70%)'
                  : 'radial-gradient(ellipse at center, rgba(0,0,0,0.22) 0%, transparent 72%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
            <Petals amount={16} tone={e.id} />
          </div>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              // Baraat: lower so the panel covers from mid-couple down past the belly
              justifyContent: e.id === 'baraat' ? 'flex-start' : 'center',
              padding:
                e.id === 'baraat'
                  ? isRtl
                    ? '52% 20px 18px'
                    : '52% 22px 18px'
                  : isRtl
                    ? '24px 20px'
                    : '24px 22px',
              boxSizing: 'border-box',
              // Pass swipes through empty chrome; only the glass panel is interactive.
              pointerEvents: 'none',
              touchAction: 'pan-y',
            }}
          >
            {/*
              Full-opacity glass + transform-only slide (bottom → rest).
              Never animate opacity on backdrop-filter — that causes blur glitches.
            */}
            <div
              dir={isRtl ? 'rtl' : 'ltr'}
              lang={isRtl ? 'ur' : 'en'}
              style={{
                width: '100%',
                maxWidth: isRtl ? 292 : 300,
                padding: isRtl ? '16px 14px 18px' : '18px 16px 20px',
                borderRadius: 18,
                background: ev.panelBg,
                border: `1px solid ${ev.panelBorder}`,
                boxShadow:
                  e.id === 'mehndi'
                    ? '0 8px 28px rgba(61, 52, 41, 0.1)'
                    : '0 10px 32px rgba(0, 0, 0, 0.28)',
                backdropFilter: 'blur(22px) saturate(1.08)',
                WebkitBackdropFilter: 'blur(22px) saturate(1.08)',
                isolation: 'isolate',
                opacity: 1,
                transform: panelIn ? 'translate3d(0, 0, 0)' : 'translate3d(0, 72px, 0)',
                transition: 'transform 1.35s cubic-bezier(0.22, 0.82, 0.28, 1)',
                willChange: 'transform',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                overflowWrap: 'anywhere',
                wordBreak: 'normal',
                pointerEvents: 'auto',
              }}
            >
          <p
            className="eyebrow"
            style={{
              color: ev.cardAccent,
              position: 'relative',
              zIndex: 2,
              letterSpacing: isRtl ? '0.08em' : '0.28em',
              fontSize: isRtl ? 12 : 11,
              fontWeight: 700,
              fontFamily: isRtl ? "'Amiri', serif" : undefined,
              maxWidth: '100%',
              textAlign: 'center',
              width: '100%',
            }}
          >
            0{i + 1}
          </p>
          <h2
            style={{
              color: ev.cardInk,
              position: 'relative',
              zIndex: 2,
              margin: '8px 0 2px',
              fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
              fontSize: isRtl ? 'clamp(26px, 7vw, 34px)' : 'clamp(32px, 8vw, 42px)',
              fontWeight: 600,
              lineHeight: isRtl ? 1.55 : 1.08,
              letterSpacing: isRtl ? '0' : '0.01em',
              maxWidth: '100%',
              overflowWrap: 'anywhere',
              textAlign: 'center',
            }}
          >
            {isRtl ? n[1] : n[0]}
            <em
              style={{
                color: ev.cardAccent,
                display: 'block',
                fontSize: isRtl ? '0.55em' : '0.42em',
                marginTop: 8,
                fontStyle: isRtl ? 'normal' : 'italic',
                fontWeight: isRtl ? 600 : 500,
                lineHeight: isRtl ? 1.7 : 1.35,
                letterSpacing: isRtl ? '0' : '0.03em',
                maxWidth: '100%',
                overflowWrap: 'anywhere',
              }}
            >
              {isRtl ? s[1] : s[0]}
            </em>
          </h2>
          <Ornament color={ev.cardAccent} />
          <div
            className="date"
            style={{
              position: 'relative',
              zIndex: 2,
              margin: '12px 0 8px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: isRtl ? 8 : 10,
              maxWidth: '100%',
            }}
          >
            <strong
              style={{
                color: ev.cardInk,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: isRtl ? 'clamp(52px, 13vw, 68px)' : 'clamp(64px, 15vw, 80px)',
                lineHeight: 0.85,
                fontWeight: 600,
              }}
            >
              {date.getDate()}
            </strong>
            <span
              style={{
                textAlign: isRtl ? 'right' : 'left',
                color: ev.cardInkSoft,
                fontSize: 15,
                fontWeight: 600,
                lineHeight: isRtl ? 1.55 : 1.25,
                fontFamily: isRtl ? "'Amiri', serif" : undefined,
                maxWidth: isRtl ? 140 : undefined,
              }}
            >
              {dayName}
              <small
                style={{
                  display: 'block',
                  marginTop: 4,
                  letterSpacing: isRtl ? '0.02em' : '0.12em',
                  color: ev.cardAccent,
                  fontFamily: isRtl ? "'Amiri', serif" : undefined,
                  fontSize: isRtl ? 12 : 11,
                  fontWeight: 700,
                  lineHeight: isRtl ? 1.6 : 1.3,
                  overflowWrap: 'anywhere',
                }}
              >
                {monthLabel} · {date.getFullYear()}
              </small>
            </span>
          </div>
          <p
            className="event-time"
            style={{
              color: ev.cardAccent,
              position: 'relative',
              zIndex: 2,
              fontFamily: isRtl ? "'Amiri', serif" : "'DM Sans', sans-serif",
              letterSpacing: isRtl ? '0' : '0.04em',
              lineHeight: isRtl ? 1.75 : 1.4,
              fontSize: isRtl ? 14 : 13,
              fontWeight: 600,
              margin: '2px 0 0',
              maxWidth: '100%',
              overflowWrap: 'anywhere',
              textAlign: 'center',
            }}
          >
            {timeLabel}
          </p>
          <div
            className="venue"
            style={{
              color: ev.cardInk,
              position: 'relative',
              zIndex: 2,
              fontSize: 14,
              fontWeight: 600,
              marginTop: 6,
              fontFamily: isRtl ? "'Amiri', serif" : undefined,
              lineHeight: isRtl ? 1.7 : 1.4,
              maxWidth: '100%',
              overflowWrap: 'anywhere',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <MapPin size={15} color={ev.cardAccent} />
              <span>{e.venue}</span>
            </span>
            {e.address ? (
              <span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: ev.cardInkSoft, marginTop: 2 }}>
                {e.address}
              </span>
            ) : null}
          </div>
          <div
            className="actions"
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 12,
              width: '100%',
            }}
          >
            <a
              href={e.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="btn soft"
              style={{
                background: ev.buttonBg,
                borderColor: ev.buttonBorder,
                color: ev.buttonText,
                fontWeight: 600,
                fontSize: isRtl ? 12 : 11,
                fontFamily: isRtl ? "'Amiri', serif" : undefined,
                minHeight: 38,
                padding: '8px 12px',
              }}
            >
              <Map size={13} /> {t(locale, 'maps')}
            </a>
            <button
              type="button"
              className="btn soft"
              onClick={() => addEventToNativeCalendar(e)}
              style={{
                background: ev.buttonBg,
                borderColor: ev.buttonBorder,
                color: ev.buttonText,
                fontWeight: 600,
                fontSize: isRtl ? 12 : 11,
                fontFamily: isRtl ? "'Amiri', serif" : undefined,
                minHeight: 38,
                padding: '8px 12px',
              }}
            >
              <CalendarDays size={13} /> {t(locale, 'calendar')}
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </Card>
  );
}

export function EventSchedule({ eventId, locale }: { eventId: 'mehndi' | 'baraat' | 'waleema'; locale: Locale }) {
  const data = schedulesData[eventId];
  const isRtl = locale === 'ur';
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const ev = theme.events[eventId];

  return (
    <Card
      className={`event-schedule ${eventId}`}
      style={{
        background: ev.bg,
        borderTop: `1px solid ${ev.border}`,
        position: 'relative',
        overflow: 'visible',
        textAlign: isRtl ? 'right' : 'left',
        padding: isRtl ? '108px 22px 180px' : '120px 28px 168px',
        color: theme.colors.ink,
      }}
    >
      <TopCanopyArch type={eventId} />
      <Petals
        amount={14}
        tone={
          eventId === 'waleema' ? 'waleema-schedule' : eventId === 'baraat' ? 'baraat-schedule' : eventId
        }
      />
      <ScheduleBow id={eventId} isRtl={isRtl} />

      <div style={{ width: '100%', textAlign: 'center', marginBottom: isRtl ? 24 : 28, position: 'relative', zIndex: 2 }}>
        <p
          className="eyebrow"
          style={{
            color: theme.colors.gold,
            letterSpacing: isRtl ? '0.12em' : '0.3em',
            fontFamily: isRtl ? "'Amiri', serif" : undefined,
          }}
        >
          {isRtl ? 'تقریب کا شیڈول' : 'EVENT TIMELINE'}
        </p>
        <h2
          style={{
            color: theme.colors.ink,
            margin: '8px 0 14px',
            fontFamily: isRtl ? "'Amiri', serif" : undefined,
            lineHeight: isRtl ? 1.6 : undefined,
          }}
        >
          {isRtl ? data.nameUr : data.nameEn}
          <em
            style={{
              color: theme.colors.gold,
              fontStyle: isRtl ? 'normal' : 'italic',
              display: 'block',
              fontSize: isRtl ? '0.72em' : '0.65em',
              marginTop: 6,
              lineHeight: isRtl ? 1.7 : undefined,
            }}
          >
            {isRtl ? 'تفصیلی شیڈول' : 'Schedule'}
          </em>
        </h2>
        <Ornament />
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 380,
          margin: '0 auto',
          paddingLeft: isRtl ? 8 : 36,
          paddingRight: isRtl ? 36 : 8,
          paddingBottom: 56,
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 12,
            bottom: 40,
            left: isRtl ? 'auto' : 10,
            right: isRtl ? 10 : 'auto',
            width: 2,
            background: `linear-gradient(180deg, ${theme.colors.gold} 0%, rgba(198,161,91,0.2) 100%)`,
          }}
        />
        {data.items.map((item, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
              style={{
                position: 'relative',
                display: 'block',
                width: '100%',
                marginBottom: idx === data.items.length - 1 ? 40 : 18,
                cursor: 'pointer',
                padding: isRtl ? '12px 14px 14px' : '10px 14px',
                borderRadius: 14,
                background: isSelected ? 'rgba(198,161,91,0.12)' : 'transparent',
                border: isSelected ? `1px solid ${theme.colors.goldLine}` : '1px solid transparent',
                transition: 'background 0.25s ease, border-color 0.25s ease',
                font: 'inherit',
                color: 'inherit',
                textAlign: isRtl ? 'right' : 'left',
                touchAction: 'manipulation',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: isRtl ? 'auto' : -33,
                  right: isRtl ? -33 : 'auto',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: isSelected ? theme.colors.gold : theme.colors.cardSolid,
                  border: `2px solid ${theme.colors.gold}`,
                }}
              />
              <span
                style={{
                  display: 'block',
                  fontSize: isRtl ? 13 : 11,
                  fontWeight: 600,
                  letterSpacing: isRtl ? '0.02em' : '0.14em',
                  color: theme.colors.gold,
                  marginBottom: 4,
                  fontFamily: isRtl ? "'Amiri', serif" : undefined,
                  lineHeight: isRtl ? 1.7 : undefined,
                }}
              >
                {isRtl ? item.timeUr : item.timeEn}
              </span>
              <h3
                style={{
                  margin: '0 0 6px',
                  fontSize: isRtl ? 20 : 24,
                  color: theme.colors.ink,
                  fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
                  lineHeight: isRtl ? 1.7 : 1.2,
                  overflowWrap: 'break-word',
                  wordBreak: 'normal',
                }}
              >
                {isRtl ? item.titleUr : item.titleEn}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: isRtl ? 14 : 13,
                  color: theme.colors.inkSoft,
                  lineHeight: isRtl ? 1.85 : 1.45,
                  fontFamily: isRtl ? "'Amiri', serif" : undefined,
                  overflowWrap: 'break-word',
                }}
              >
                {isRtl ? item.descUr : item.descEn}
              </p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
