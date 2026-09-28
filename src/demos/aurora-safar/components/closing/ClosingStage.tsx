'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { theme } from '@/demos/aurora-safar/config/theme';
import type { Locale } from '@/demos/aurora-safar/config/translations';
import RsvpCard from '@/demos/aurora-safar/components/rsvp/RsvpCard';

export default function ClosingStage({ locale }: { locale: Locale }) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onPage = useRef(false);
  const [showRsvp, setShowRsvp] = useState(false);

  const videoSrc = `${theme.videos.closing}?v=${theme.videos.version}`;
  const posterSrc = `${theme.videos.closingPoster}?v=${theme.videos.version}`;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const video = videoRef.current;
        if (!entry || !video) return;

        if (entry.intersectionRatio >= 0.9) {
          if (onPage.current) return;
          onPage.current = true;
          setShowRsvp(false);
          video.muted = true;
          video.defaultMuted = true;
          video.playsInline = true;
          video.setAttribute('muted', '');
          video.setAttribute('playsinline', '');
          video.setAttribute('webkit-playsinline', '');
          if (video.readyState >= 1) video.currentTime = 0;
          const pending = video.play();
          void pending?.catch(() => {
            if (onPage.current) setShowRsvp(true);
          });
          return;
        }

        if (entry.intersectionRatio < 0.5) {
          onPage.current = false;
          video.pause();
          if (video.readyState >= 1) video.currentTime = 0;
          setShowRsvp(false);
        }
      },
      { threshold: [0, 0.5, 0.9] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="closing-stage page-snap"
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        background: '#14060a',
      }}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc}
        playsInline
        muted
        preload="metadata"
        controls={false}
        disablePictureInPicture
        onEnded={() => setShowRsvp(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />

      <AnimatePresence>
        {showRsvp && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'max(14px, env(safe-area-inset-top, 0px)) 14px max(14px, env(safe-area-inset-bottom, 0px))',
              background: 'linear-gradient(180deg, rgba(10,4,6,0.28), rgba(10,4,6,0.62))',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <RsvpCard locale={locale} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
