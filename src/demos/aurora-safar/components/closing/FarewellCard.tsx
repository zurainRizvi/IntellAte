'use client';

import React from 'react';
import { theme } from '@/demos/aurora-safar/config/theme';
import { Card, Ornament } from '@/demos/aurora-safar/components/shared/Ornament';
import { Petals } from '@/demos/aurora-safar/components/shared/Petals';
import { BotanicalClimber } from '@/demos/aurora-safar/components/events/Botanicals';
import type { Locale } from '@/demos/aurora-safar/config/translations';

const PAGE_BG = '#E4E5E0';
const ACCENT = theme.colors.blush;
const ACCENT_DEEP = theme.colors.blushDeep;

/** Closing farewell note — sits before the final video + RSVP. */
export default function FarewellCard({ locale }: { locale: Locale }) {
  const isRtl = locale === 'ur';

  return (
    <Card
      className="farewell"
      id="farewell-section"
      style={{
        background: PAGE_BG,
        borderTop: `1px solid ${theme.colors.blushLine}`,
        width: '100%',
        padding: 0,
        position: 'relative',
        overflow: 'hidden',
        color: theme.colors.ink,
        justifyContent: 'flex-start',
      }}
    >
      <BotanicalClimber type="baraat" />
      <Petals tone="red-white" amount={24} />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding:
            isRtl
              ? 'clamp(108px, 16vh, 132px) 28px max(36px, calc(env(safe-area-inset-bottom, 0px) + 24px))'
              : 'clamp(112px, 15.5vh, 136px) 30px max(36px, calc(env(safe-area-inset-bottom, 0px) + 24px))',
        }}
      >
        <div
          style={{
            maxWidth: 320,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <p
            className="eyebrow"
            style={{
              color: ACCENT,
              letterSpacing: isRtl ? '0.1em' : '0.32em',
              marginBottom: 14,
              fontFamily: isRtl ? "'Amiri', serif" : undefined,
            }}
          >
            {isRtl ? 'دعائے خیر' : 'WITH GRATITUDE'}
          </p>

          <p
            className="arabic"
            style={{
              fontSize: 'clamp(22px, 5.6vw, 26px)',
              lineHeight: 2.05,
              color: theme.colors.ink,
              margin: '0 0 6px',
              fontFamily: "'Amiri', serif",
            }}
          >
            بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
          </p>

          <Ornament color={ACCENT} />

          <h2
            style={{
              fontSize: isRtl ? 'clamp(26px, 7vw, 34px)' : 'clamp(30px, 8vw, 38px)',
              lineHeight: isRtl ? 1.55 : 1.18,
              margin: '14px 0 0',
              fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: isRtl ? 0 : '0.01em',
            }}
          >
            {isRtl ? (
              <>
                <span>آپ کی آمد، </span>
                <em
                  style={{
                    color: ACCENT_DEEP,
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontFamily: "'Amiri', serif",
                  }}
                >
                  ہماری خوشی۔
                </em>
              </>
            ) : (
              <>
                <span>Your presence, </span>
                <em
                  style={{
                    color: ACCENT_DEEP,
                    fontStyle: 'italic',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  our joy.
                </em>
              </>
            )}
          </h2>

          <div
            aria-hidden
            style={{
              width: 48,
              height: 1,
              margin: isRtl ? '18px auto 16px' : '20px auto 16px',
              background: `linear-gradient(90deg, transparent, ${theme.colors.gold}, transparent)`,
              opacity: 0.85,
            }}
          />

          <p
            style={{
              margin: 0,
              fontSize: isRtl ? 16 : 15,
              lineHeight: isRtl ? 1.9 : 1.65,
              color: theme.colors.inkSoft,
              fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
              fontWeight: isRtl ? 400 : 500,
              fontStyle: isRtl ? 'normal' : 'italic',
              letterSpacing: isRtl ? 0 : '0.02em',
              maxWidth: 290,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            {isRtl
              ? 'ہم اپنے تمام عزیز خاندان اور پیاروں کی آمد کے منتظر ہیں تاکہ ہمارا جشن مکمل ہو۔'
              : 'Awaiting the presence of all our beloved family members and loved ones to make our celebration complete.'}
          </p>
        </div>
      </div>
    </Card>
  );
}
