'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';

function Gull({ flip, size }: { flip: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.42)}
      viewBox="0 0 72 28"
      aria-hidden
      style={{
        display: 'block',
        transform: flip ? 'scaleX(-1)' : undefined,
        filter: 'drop-shadow(0 1px 1px rgba(255,244,220,0.55)) drop-shadow(0 2px 3px rgba(40,24,12,0.4))',
        overflow: 'visible',
      }}
    >
      <path
        className="bird-wing"
        d="M2 16 C12 4 22 8 34 15 C46 6 58 2 70 11 C58 9 48 13 36 18 C26 16 14 18 2 16 Z"
        fill="#241C18"
      />
      <path d="M30 16 L36 15 L34 22 Z" fill="#241C18" />
    </svg>
  );
}

const FLOCK = [
  { id: 'a', top: '6%', size: 46, duration: 18, delay: -2, flip: false, flap: 0.42 },
  { id: 'b', top: '28%', size: 22, duration: 24, delay: -11, flip: true, flap: 0.55 },
  { id: 'c', top: '14%', size: 30, duration: 16, delay: -7, flip: false, flap: 0.38 },
  { id: 'd', top: '42%', size: 18, duration: 27, delay: -15, flip: true, flap: 0.62 },
  { id: 'e', top: '22%', size: 38, duration: 20, delay: -4, flip: false, flap: 0.34 },
  { id: 'f', top: '34%', size: 16, duration: 22, delay: -18, flip: true, flap: 0.5 },
  { id: 'g', top: '10%', size: 24, duration: 19, delay: -9, flip: false, flap: 0.46 },
];

export function Birds() {
  const reduce = useReducedMotion();

  return (
    <div className="hero-birds" aria-hidden>
      {FLOCK.map((bird) => (
        <div
          key={bird.id}
          className={reduce ? undefined : bird.flip ? 'bird-fly-left' : 'bird-fly-right'}
          style={{
            position: 'absolute',
            top: bird.top,
            left: 0,
            width: '100%',
            pointerEvents: 'none',
            animationDuration: `${bird.duration}s`,
            animationDelay: `${bird.delay}s`,
            transform: reduce ? `translateX(${bird.flip ? '68%' : '22%'})` : undefined,
          }}
        >
          <div style={{ width: 'fit-content', animationDuration: `${bird.flap}s` }} className={reduce ? undefined : 'bird-flap'}>
            <Gull flip={bird.flip} size={bird.size} />
          </div>
        </div>
      ))}
    </div>
  );
}
