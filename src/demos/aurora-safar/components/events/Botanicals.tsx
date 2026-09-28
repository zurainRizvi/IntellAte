'use client';

import React from 'react';
import { theme, type EventThemeId } from '@/demos/aurora-safar/config/theme';

/* Reusable Top Floral Arch Canopy (Spanning across top corners & center) */
export function TopCanopyArch({ type }: { type: EventThemeId }) {
  const flowerColors = theme.events[type].flower;

  return (
    <svg
      className="garland-svg-strand"
      viewBox="0 0 420 110"
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: '110px',
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 1,
        filter: 'drop-shadow(0 3px 8px rgba(61,52,41,0.18))',
        transformOrigin: 'top center',
      }}
    >
      {/* 1. Sweeping Gold Arch Vines */}
      <path
        d="M 0 0 Q 70 8 135 32 Q 180 50 210 56"
        fill="none"
        stroke="#C6A15B"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M 420 0 Q 350 8 285 32 Q 240 50 210 56"
        fill="none"
        stroke="#C6A15B"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* 2. Secondary Delicate Filigree Swirls */}
      <path d="M 0 12 Q 55 18 115 45 Q 165 65 210 68" fill="none" stroke="#E0C075" strokeWidth="1.2" opacity="0.75" />
      <path d="M 420 12 Q 365 18 305 45 Q 255 65 210 68" fill="none" stroke="#E0C075" strokeWidth="1.2" opacity="0.75" />
      <path d="M 210 56 Q 210 74 214 80 Q 218 84 212 88" fill="none" stroke="#C6A15B" strokeWidth="1" opacity="0.8" />

      {/* 3. Top Arch Heart Leaves (Physically attached with gold stems) */}
      {[
        // Left Arch Leaves
        { stemX: 15, stemY: 3, lx: 25, ly: 14, angle: 30, s: 1.3 },
        { stemX: 45, stemY: 8, lx: 35, ly: 22, angle: -25, s: 1.2 },
        { stemX: 75, stemY: 15, lx: 88, ly: 28, angle: 35, s: 1.4 },
        { stemX: 110, stemY: 26, lx: 100, ly: 42, angle: -20, s: 1.3 },
        { stemX: 145, stemY: 38, lx: 158, ly: 52, angle: 32, s: 1.4 },
        { stemX: 180, stemY: 48, lx: 172, ly: 64, angle: -15, s: 1.2 },

        // Right Arch Leaves (Mirrored)
        { stemX: 405, stemY: 3, lx: 395, ly: 14, angle: -30, s: 1.3 },
        { stemX: 375, stemY: 8, lx: 385, ly: 22, angle: 25, s: 1.2 },
        { stemX: 345, stemY: 15, lx: 332, ly: 28, angle: -35, s: 1.4 },
        { stemX: 310, stemY: 26, lx: 320, ly: 42, angle: 20, s: 1.3 },
        { stemX: 275, stemY: 38, lx: 262, ly: 52, angle: -32, s: 1.4 },
        { stemX: 240, stemY: 48, lx: 248, ly: 64, angle: 15, s: 1.2 },

        // Center Crest Pair
        { stemX: 205, stemY: 55, lx: 198, ly: 68, angle: -10, s: 1.1 },
        { stemX: 215, stemY: 55, lx: 222, ly: 68, angle: 10, s: 1.1 },
      ].map((leaf, idx) => {
        const tone = idx % 3;
        const fill = tone === 0 ? '#FFFFFF' : tone === 1 ? flowerColors.secondary : flowerColors.primary;
        const stroke = tone === 0 ? '#E0D6C3' : tone === 1 ? flowerColors.primary : flowerColors.dark;
        return (
        <g key={idx}>
          <path
            d={`M ${leaf.stemX} ${leaf.stemY} Q ${(leaf.stemX + leaf.lx) / 2} ${(leaf.stemY + leaf.ly) / 2 - 2} ${leaf.lx} ${leaf.ly}`}
            fill="none"
            stroke="#C6A15B"
            strokeWidth={0.8 * leaf.s}
            strokeLinecap="round"
          />
          <g transform={`translate(${leaf.lx}, ${leaf.ly}) rotate(${leaf.angle}) scale(${leaf.s})`}>
            <path
              d="M 0 0 C -5 -8 -13 -5 -10 4 C -7 12 0 16 0 16 C 0 16 7 12 10 4 C 13 -5 5 -8 0 0 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="0.5"
              opacity={tone === 0 ? 1 : 0.92}
            />
            <path d="M 0 0 L 0 13" stroke="#C6A15B" strokeWidth="0.5" opacity="0.85" />
          </g>
        </g>
        );
      })}

      {/* 4. Top Arch Theme Blossoms */}
      {[
        { cx: 30, cy: 6, r: 7.5 },
        { cx: 95, cy: 22, r: 8.5 },
        { cx: 165, cy: 45, r: 8 },
        { cx: 210, cy: 56, r: 9 },  // Center crowning blossom
        { cx: 255, cy: 45, r: 8 },
        { cx: 325, cy: 22, r: 8.5 },
        { cx: 390, cy: 6, r: 7.5 },
      ].map((fl, i) => (
        <g key={i} transform={`translate(${fl.cx}, ${fl.cy})`}>
          {[0, 72, 144, 216, 288].map((angle, k) => (
            <ellipse
              key={k}
              cx={Math.cos((angle * Math.PI) / 180) * (fl.r * 0.7)}
              cy={Math.sin((angle * Math.PI) / 180) * (fl.r * 0.7)}
              rx={fl.r * 0.65}
              ry={fl.r * 0.45}
              transform={`rotate(${angle})`}
              fill={flowerColors.primary}
              opacity="0.95"
            />
          ))}
          <circle cx="0" cy="0" r={fl.r * 0.35} fill={flowerColors.secondary} />
          <circle cx="0" cy="0" r={fl.r * 0.18} fill="#ffffff" />
        </g>
      ))}

      {/* 5. Top Arch Pearl Buds */}
      {[
        { cx: 60, cy: 12 },
        { cx: 130, cy: 34 },
        { cx: 190, cy: 52 },
        { cx: 230, cy: 52 },
        { cx: 290, cy: 34 },
        { cx: 360, cy: 12 },
      ].map((b, i) => (
        <g key={i} transform={`translate(${b.cx}, ${b.cy})`}>
          <circle cx="0" cy="0" r="3" fill="#F7F4EB" stroke="#C6A15B" strokeWidth="0.6" />
          <circle cx="0" cy="0" r="1.5" fill={flowerColors.secondary} />
        </g>
      ))}
    </svg>
  );
}

/* Distinct Royal Gold Botanical Corner Spray for Event Cards */
export function EventCornerOrnament({ type, isRtl }: { type: EventThemeId; isRtl: boolean }) {
  const gemColor = theme.events[type].flower.primary;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: isRtl ? 'auto' : '18px',
        left: isRtl ? '18px' : 'auto',
        transform: isRtl ? 'scaleX(-1)' : 'none',
        opacity: 0.88,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    >
      <svg width="74" height="74" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient id={`goldCornerGrad-${type}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF4D6" />
            <stop offset="50%" stopColor="#D4AF57" />
            <stop offset="100%" stopColor="#96732B" />
          </linearGradient>
          <filter id={`cornerGlow-${type}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>
        <g filter={`url(#cornerGlow-${type})`}>
          <path d="M 75 75 Q 40 70 20 45 Q 8 25 5 0" stroke={`url(#goldCornerGrad-${type})`} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 75 75 Q 65 40 45 20 Q 25 8 0 5" stroke={`url(#goldCornerGrad-${type})`} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M 28 52 C 22 46 20 36 28 32 C 34 28 40 36 34 42 C 30 46 26 44 26 40" stroke="#E0C075" strokeWidth="1.2" fill="none" />
          <path d="M 52 28 C 46 22 36 20 32 28 C 28 34 36 40 42 34 C 46 30 44 26 40 26" stroke="#E0C075" strokeWidth="1.2" fill="none" />
          <path d="M 70 70 Q 55 58 46 64 Q 58 75 70 70 Z" fill="#FFFFFF" stroke="#D4AF57" strokeWidth="0.5" opacity="0.95" />
          <path d="M 70 70 Q 58 55 64 46 Q 75 58 70 70 Z" fill="#FFFFFF" stroke="#D4AF57" strokeWidth="0.5" opacity="0.95" />
          <path d="M 46 64 Q 35 55 38 46 Q 48 52 46 64 Z" fill="#FFFFFF" stroke="#D4AF57" strokeWidth="0.5" opacity="0.9" />
          <path d="M 64 46 Q 55 35 46 38 Q 52 48 64 46 Z" fill="#FFFFFF" stroke="#D4AF57" strokeWidth="0.5" opacity="0.9" />

          <g transform="translate(56, 56)">
            {[0, 72, 144, 216, 288].map((angle, k) => (
              <ellipse
                key={k}
                cx={Math.cos((angle * Math.PI) / 180) * 5.5}
                cy={Math.sin((angle * Math.PI) / 180) * 5.5}
                rx={4.5}
                ry={3.2}
                transform={`rotate(${angle})`}
                fill={gemColor}
                opacity="0.95"
              />
            ))}
            <circle cx="0" cy="0" r="3" fill="#FFE599" stroke="#96732B" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1.4" fill="#FFFFFF" />
          </g>

          <circle cx="16" cy="18" r="2.5" fill="#FFF8E7" stroke="#D4AF57" strokeWidth="0.6" />
          <circle cx="18" cy="16" r="2.5" fill="#FFF8E7" stroke="#D4AF57" strokeWidth="0.6" />
          <circle cx="34" cy="12" r="2" fill="#FFF8E7" stroke="#D4AF57" strokeWidth="0.5" />
          <circle cx="12" cy="34" r="2" fill="#FFF8E7" stroke="#D4AF57" strokeWidth="0.5" />
        </g>
      </svg>
    </div>
  );
}

/* Luxury Botanical Climbing Creeper Vines with Top Canopy Arch & Mirrored Symmetry */
export function BotanicalClimber({ type }: { type: EventThemeId }) {
  const flowerColors = theme.events[type].flower;

  // A single side's climber SVG (Left-oriented, right side will scaleX(-1))
  const renderClimberSide = () => (
    <svg
      viewBox="0 0 150 680"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        filter: 'drop-shadow(0 3px 6px rgba(61,52,41,0.16))',
      }}
    >
      {/* 1. Main Continuous Golden Climbing Stem */}
      <path
        d="M 0 0 C 18 35 34 85 24 160 C 14 240 42 320 32 410 C 22 500 38 580 25 670"
        fill="none"
        stroke="#C6A15B"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* 2. Secondary Intertwined Golden Stem */}
      <path
        d="M 2 15 C 32 70 12 180 36 270 C 18 370 42 470 20 570"
        fill="none"
        stroke="#E0C075"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* 3. Delicate Curling Tendrils */}
      <path d="M 8 28 C 20 22 26 34 18 40 C 12 44 8 36 14 32" fill="none" stroke="#C6A15B" strokeWidth="1" opacity="0.8" />
      <path d="M 28 200 C 44 195 50 210 40 218 C 32 222 28 212 36 208" fill="none" stroke="#C6A15B" strokeWidth="1" opacity="0.8" />
      <path d="M 36 430 C 50 425 56 440 46 448 C 38 452 34 442 42 438" fill="none" stroke="#C6A15B" strokeWidth="1" opacity="0.8" />

      {/* 4. Physical Branch Stems & Heart Leaves (white + themed colors mixed) */}
      {[
        // --- TOP ROOT CLUSTER (Dense, lush, directly on root corner) ---
        { stemX: 2, stemY: 4, lx: 14, ly: 12, angle: 35, s: 1.5 },
        { stemX: 6, stemY: 16, lx: -6, ly: 26, angle: -45, s: 1.3 },
        { stemX: 12, stemY: 32, lx: 26, ly: 38, angle: 42, s: 1.4 },
        { stemX: 16, stemY: 48, lx: 4, ly: 58, angle: -30, s: 1.2 },
        { stemX: 22, stemY: 65, lx: 36, ly: 74, angle: 38, s: 1.4 },

        // --- BODY OF CLIMBING VINE (Ascending from top to bottom) ---
        { stemX: 28, stemY: 95, lx: 14, ly: 108, angle: -32, s: 1.3 },
        { stemX: 26, stemY: 130, lx: 42, ly: 142, angle: 40, s: 1.5 },
        { stemX: 22, stemY: 170, lx: 8, ly: 182, angle: -35, s: 1.3 },
        { stemX: 18, stemY: 210, lx: 34, ly: 222, angle: 36, s: 1.4 },
        { stemX: 18, stemY: 250, lx: 4, ly: 264, angle: -38, s: 1.5 },
        { stemX: 24, stemY: 290, lx: 42, ly: 304, angle: 35, s: 1.4 },
        { stemX: 32, stemY: 335, lx: 16, ly: 348, angle: -30, s: 1.3 },
        { stemX: 38, stemY: 380, lx: 54, ly: 394, angle: 38, s: 1.5 },
        { stemX: 34, stemY: 425, lx: 18, ly: 438, angle: -34, s: 1.4 },
        { stemX: 28, stemY: 470, lx: 46, ly: 485, angle: 32, s: 1.3 },
        { stemX: 24, stemY: 515, lx: 8, ly: 528, angle: -28, s: 1.4 },
        { stemX: 26, stemY: 565, lx: 42, ly: 578, angle: 30, s: 1.2 },
        { stemX: 34, stemY: 615, lx: 18, ly: 628, angle: -25, s: 1.1 },
      ].map((leaf, idx) => {
        const tone = idx % 3;
        const fill = tone === 0 ? '#FFFFFF' : tone === 1 ? flowerColors.secondary : flowerColors.primary;
        const stroke = tone === 0 ? '#E0D6C3' : tone === 1 ? flowerColors.primary : flowerColors.dark;
        return (
        <g key={idx} className="climber-leaf">
          {/* Physical Branch Petiole from Vine directly to Leaf */}
          <path
            d={`M ${leaf.stemX} ${leaf.stemY} Q ${(leaf.stemX + leaf.lx) / 2} ${(leaf.stemY + leaf.ly) / 2 - 2} ${leaf.lx} ${leaf.ly}`}
            fill="none"
            stroke="#C6A15B"
            strokeWidth={0.8 * leaf.s}
            strokeLinecap="round"
          />
          {/* Heart Leaf Shape */}
          <g transform={`translate(${leaf.lx}, ${leaf.ly}) rotate(${leaf.angle}) scale(${leaf.s})`}>
            <path
              d="M 0 0 C -5 -8 -13 -5 -10 4 C -7 12 0 16 0 16 C 0 16 7 12 10 4 C 13 -5 5 -8 0 0 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="0.5"
              opacity={tone === 0 ? 1 : 0.92}
            />
            {/* Gold Central Vein & Side Ribs */}
            <path d="M 0 0 L 0 13" stroke="#C6A15B" strokeWidth="0.5" opacity="0.85" />
            <path d="M 0 4 L -4 2" stroke="#C6A15B" strokeWidth="0.3" opacity="0.6" />
            <path d="M 0 4 L 4 2" stroke="#C6A15B" strokeWidth="0.3" opacity="0.6" />
            <path d="M 0 8 L -5 6" stroke="#C6A15B" strokeWidth="0.3" opacity="0.6" />
            <path d="M 0 8 L 5 6" stroke="#C6A15B" strokeWidth="0.3" opacity="0.6" />
          </g>
        </g>
        );
      })}

      {/* 5. Theme Blossoms Anchored Along the Vine */}
      {[
        { cx: 8, cy: 22, r: 7 },    // Root blossom
        { cx: 20, cy: 80, r: 8 },   // Upper blossom
        { cx: 24, cy: 155, r: 8.5 },
        { cx: 20, cy: 235, r: 8 },
        { cx: 34, cy: 320, r: 9 },
        { cx: 36, cy: 410, r: 8.5 },
        { cx: 26, cy: 495, r: 7.5 },
        { cx: 30, cy: 590, r: 7 },
      ].map((fl, i) => (
        <g key={i} className="climber-bloom" transform={`translate(${fl.cx}, ${fl.cy})`}>
          {[0, 72, 144, 216, 288].map((angle, k) => (
            <ellipse
              key={k}
              cx={Math.cos((angle * Math.PI) / 180) * (fl.r * 0.7)}
              cy={Math.sin((angle * Math.PI) / 180) * (fl.r * 0.7)}
              rx={fl.r * 0.65}
              ry={fl.r * 0.45}
              transform={`rotate(${angle})`}
              fill={flowerColors.primary}
              opacity="0.95"
            />
          ))}
          <circle cx="0" cy="0" r={fl.r * 0.35} fill={flowerColors.secondary} />
          <circle cx="0" cy="0" r={fl.r * 0.18} fill="#ffffff" />
        </g>
      ))}

      {/* 6. Golden Floral Buds Anchored Along Vine */}
      {[
        { cx: 14, cy: 12 },  // Root bud
        { cx: -2, cy: 42 },  // Root bud 2
        { cx: 32, cy: 115 },
        { cx: 12, cy: 195 },
        { cx: 40, cy: 275 },
        { cx: 22, cy: 365 },
        { cx: 44, cy: 455 },
        { cx: 18, cy: 545 },
        { cx: 36, cy: 640 },
      ].map((b, i) => (
        <g key={i} className="climber-bud" transform={`translate(${b.cx}, ${b.cy})`}>
          <circle cx="0" cy="0" r="3.2" fill="#F7F4EB" stroke="#C6A15B" strokeWidth="0.6" />
          <circle cx="0" cy="0" r="1.6" fill={flowerColors.secondary} />
        </g>
      ))}
    </svg>
  );

  return (
    <div
      className="botanical-climber-container"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Top Canopy Arch */}
      <TopCanopyArch type={type} />

      {/* Left Climber */}
      <div
        className="climber-side climber-side-left"
        style={{
          position: 'absolute',
          top: 0,
          left: '6px',
          width: '28%',
          height: '88%',
          overflow: 'visible',
        }}
      >
        {renderClimberSide()}
      </div>

      {/* Right Climber (exact mirror via animated scaleX(-1)) */}
      <div
        className="climber-side climber-side-right"
        style={{
          position: 'absolute',
          top: 0,
          right: '6px',
          width: '28%',
          height: '88%',
          overflow: 'visible',
        }}
      >
        {renderClimberSide()}
      </div>
    </div>
  );
}

export function ScheduleBow({ id, isRtl }: { id: string; isRtl: boolean }) {
  const left = `bow-left-${id}`;
  const right = `bow-right-${id}`;

  return (
    <div
      className="schedule-bow"
      aria-hidden
      style={{
        position: 'absolute',
        bottom: 14,
        right: isRtl ? 'auto' : 14,
        left: isRtl ? 14 : 'auto',
        transform: isRtl ? 'scaleX(-1)' : undefined,
        opacity: 0.92,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <svg width="52" height="46" viewBox="0 0 80 70" fill="none">
        <path d="M 40 32 C 30 18 10 12 12 28 C 14 38 34 35 40 34 Z" fill={`url(#${left})`} />
        <path d="M 40 32 C 50 18 70 12 68 28 C 66 38 46 35 40 34 Z" fill={`url(#${right})`} />
        <path d="M 38 34 C 36 44 24 60 20 66 C 24 64 36 48 40 36 Z" fill={`url(#${left})`} opacity="0.9" />
        <path d="M 42 34 C 44 44 56 60 60 66 C 56 64 44 48 40 36 Z" fill={`url(#${right})`} opacity="0.9" />
        <ellipse cx="40" cy="33" rx="5.5" ry="4.6" fill="#E5C77A" stroke="#C6A15B" strokeWidth="1" />
        <defs>
          <linearGradient id={left} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF2D1" />
            <stop offset="50%" stopColor="#E0C075" />
            <stop offset="100%" stopColor="#A88338" />
          </linearGradient>
          <linearGradient id={right} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF2D1" />
            <stop offset="50%" stopColor="#E0C075" />
            <stop offset="100%" stopColor="#A88338" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

