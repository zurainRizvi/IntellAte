'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '@/demos/aurora-safar/config/theme';

export function Ornament({ color = theme.colors.gold }: { color?: string }) {
  return (
    <div
      className="ornament"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '12px auto',
        gap: '12px',
        color,
        width: '100%',
        maxWidth: '180px',
      }}
    >
      <span className="ornament-line" style={{ flex: 1, borderTop: `1px solid ${color}`, opacity: 0.75 }} />
      <span className="ornament-diamond" style={{ fontSize: '14px', lineHeight: 1, color, border: 'none', width: 'auto' }}>
        ◇
      </span>
      <span className="ornament-line" style={{ flex: 1, borderTop: `1px solid ${color}`, opacity: 0.75 }} />
    </div>
  );
}

export function Card({
  className = '',
  id,
  style,
  children,
}: {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  // Schedule/RSVP pages are tall snap targets — fade-in makes content look like it glitches on land.
  const skipEnter = /\b(event-schedule|rsvp|farewell)\b/.test(className);

  return (
    <motion.section
      id={id}
      style={{ width: '100%', margin: 0, borderRadius: 0, ...style }}
      className={`card page-snap ${className}`}
      initial={skipEnter ? false : { opacity: 0 }}
      whileInView={skipEnter ? undefined : { opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, amount: 0.12 }}
    >
      {children}
    </motion.section>
  );
}
