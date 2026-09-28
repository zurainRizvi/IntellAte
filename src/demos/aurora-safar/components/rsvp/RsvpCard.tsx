'use client';

import React, { useEffect, useRef, useState } from 'react';
import { theme } from '@/demos/aurora-safar/config/theme';
import { wedding } from '@/demos/aurora-safar/config/wedding';
import { rsvpService } from '@/demos/aurora-safar/services/rsvp';
import { type Locale } from '@/demos/aurora-safar/config/translations';
import { Ornament } from '@/demos/aurora-safar/components/shared/Ornament';
import { openWhatsAppChat } from '@/demos/aurora-safar/utils/whatsapp';

const RSVP_INK = '#F7F1E8';
const RSVP_MUTED = 'rgba(247, 241, 232, 0.72)';
const RSVP_LINE = 'rgba(212, 175, 87, 0.35)';
const RSVP_FIELD = 'rgba(255, 248, 238, 0.08)';

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.33-1.66a11.9 11.9 0 0 0 5.72 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.44-8.42zM12.06 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.99 1-3.66-.24-.38a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.13 1.03 7 2.9a9.82 9.82 0 0 1 2.89 7c0 5.45-4.44 9.9-9.88 9.9zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
    </svg>
  );
}

export default function RsvpCard({ locale }: { locale: Locale }) {
  const isRtl = locale === 'ur';
  const savedScroll = useRef<number | null>(null);
  const resumeTimer = useRef<number | null>(null);
  const pinUntil = useRef(0);
  const focusedInRsvp = useRef(false);
  const [response, setResponse] = useState<'yes' | 'no' | null>(null);
  const [guestCount, setGuestCount] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['mehndi', 'baraat', 'waleema']);
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    response: 'yes' | 'no';
    guests: string;
    events: string[];
    message: string;
    submittedAt: string;
  } | null>(null);

  const getMain = () => document.querySelector('main');

  const setSnapEnabled = (enabled: boolean) => {
    const main = getMain();
    if (!main) return;
    main.classList.toggle('snap-paused', !enabled);
  };

  const captureScrollAnchor = () => {
    const main = getMain();
    if (!main) return;
    // Prefer anchoring to the RSVP page itself — autofill often jumps after focus.
    if (savedScroll.current == null) savedScroll.current = main.scrollTop;
  };

  const pauseSnapForTyping = () => {
    const main = getMain();
    if (!main) return;
    if (resumeTimer.current != null) {
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = null;
    }
    focusedInRsvp.current = true;
    captureScrollAnchor();
    setSnapEnabled(false);
  };

  const resumeSnapSoon = () => {
    if (resumeTimer.current != null) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      const section = document.getElementById('rsvp-section');
      const active = document.activeElement;
      if (
        section &&
        (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) &&
        section.contains(active)
      ) {
        return;
      }
      focusedInRsvp.current = false;
      savedScroll.current = null;
      pinUntil.current = 0;
      setSnapEnabled(true);
      resumeTimer.current = null;
    }, 400);
  };

  /** Autofill / keyboard often yank scroll toward the closing page. */
  const correctAutofillJump = () => {
    const main = getMain();
    if (!main || savedScroll.current == null) return;
    if (Math.abs(main.scrollTop - savedScroll.current) > 2) main.scrollTop = savedScroll.current;
  };

  const pinScroll = (ms = 1400) => {
    pinUntil.current = Date.now() + ms;
    setSnapEnabled(false);
    correctAutofillJump();
    requestAnimationFrame(correctAutofillJump);
    window.setTimeout(correctAutofillJump, 16);
    window.setTimeout(correctAutofillJump, 50);
    window.setTimeout(correctAutofillJump, 120);
    window.setTimeout(correctAutofillJump, 280);
    window.setTimeout(correctAutofillJump, 600);
    window.setTimeout(correctAutofillJump, 1000);
  };

  useEffect(() => {
    const section = document.getElementById('rsvp-section');
    const main = getMain();
    if (!section || !main) return;

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      // Capture before the browser scrolls the focused field / snap neighbor into view.
      if (savedScroll.current == null) savedScroll.current = main.scrollTop;
      pauseSnapForTyping();
      pinScroll(900);
    };

    const onFocusOut = () => resumeSnapSoon();

    const shouldPinName = (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement) || target.name !== 'name') return false;
      if (e instanceof InputEvent) {
        const burst = (e.data?.length ?? 0) > 1;
        const replacement =
          e.inputType === 'insertReplacementText' ||
          e.inputType === 'insertFromAutocomplete' ||
          e.inputType === 'insertFromPaste';
        if (burst || replacement) return true;
      }
      // Browser autofill often fires a plain change with the full name.
      return e.type === 'change' && target.value.trim().length > 1;
    };

    const onAnyEdit = (e: Event) => {
      pauseSnapForTyping();
      if (shouldPinName(e)) pinScroll(1600);
    };

    const onAutoFill = (e: AnimationEvent) => {
      if (e.animationName !== 'rsvp-autofill-start') return;
      pauseSnapForTyping();
      pinScroll(1600);
    };

    const onScroll = () => {
      if (!focusedInRsvp.current && Date.now() >= pinUntil.current) return;
      // While typing or during autofill, never let scroll leave the RSVP page.
      if (savedScroll.current != null && main.scrollTop > savedScroll.current + 8) {
        main.scrollTop = savedScroll.current;
        return;
      }
      if (Date.now() < pinUntil.current) {
        correctAutofillJump();
      }
    };

    section.addEventListener('focusin', onFocusIn);
    section.addEventListener('focusout', onFocusOut);
    section.addEventListener('input', onAnyEdit, true);
    section.addEventListener('change', onAnyEdit, true);
    section.addEventListener('animationstart', onAutoFill, true);
    main.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      section.removeEventListener('focusin', onFocusIn);
      section.removeEventListener('focusout', onFocusOut);
      section.removeEventListener('input', onAnyEdit, true);
      section.removeEventListener('change', onAnyEdit, true);
      section.removeEventListener('animationstart', onAutoFill, true);
      main.removeEventListener('scroll', onScroll);
      if (resumeTimer.current != null) window.clearTimeout(resumeTimer.current);
      focusedInRsvp.current = false;
      savedScroll.current = null;
      pinUntil.current = 0;
      setSnapEnabled(true);
    };
  }, []);

  const chooseAttendance = (val: 'yes' | 'no') => {
    savedScroll.current = null;
    pinUntil.current = 0;
    setSnapEnabled(true);
    setResponse(val);
  };

  const toggleEvent = (id: string) => {
    savedScroll.current = null;
    setSnapEnabled(true);
    if (selectedEvents.includes(id)) {
      if (selectedEvents.length > 1) setSelectedEvents(selectedEvents.filter((e) => e !== id));
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };

  const getWhatsAppMessage = (data: NonNullable<typeof submittedData>) => {
    const isAttending = data.response === 'yes';
    const eventMap: Record<string, string> = {
      mehndi: 'Mehndi (12th Jan)',
      baraat: 'Baraat (13th Jan)',
      waleema: 'Waleema (14th Jan)',
    };
    const eventList = isAttending ? data.events.map((e) => `  • ${eventMap[e] || e}`).join('\n') : '  • None';
    return `✨ *AURORA SAFAR — WEDDING RSVP* ✨
━━━━━━━━━━━━━━━━━━━━━
👤 *Guest:* ${data.name}
💍 *Response:* ${isAttending ? '✅ Joyfully Attending' : '❌ Regretfully Declining'}
${isAttending ? `👥 *Guests:* ${data.guests || '1'}\n📅 *Events:*\n${eventList}\n` : ''}${data.message.trim() ? `💌 *Wishes:* "${data.message.trim()}"\n` : ''}⏰ *Sent:* ${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
━━━━━━━━━━━━━━━━━━━━━
_Ayaan & Zara's Wedding Invitation_`;
  };

  const sendToWhatsApp = (data: typeof submittedData) => {
    if (!data) return;
    openWhatsAppChat(wedding.whatsapp.contactNumber, getWhatsAppMessage(data));
  };

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!response || !guestName.trim()) return;
    const payload = {
      name: guestName.trim(),
      response,
      guests: response === 'yes' ? guestCount || '1' : '0',
      events: response === 'yes' ? selectedEvents : [],
      message: guestMessage.trim(),
      submittedAt: new Date().toISOString(),
    };
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    savedScroll.current = null;
    pinUntil.current = 0;
    setSnapEnabled(true);
    setSubmittedData(payload);
    try {
      await rsvpService.submit({ ...payload, guests: Number(payload.guests) });
    } catch {
      // A local save failure should still show the saved confirmation.
    }
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.65 },
        colors: [theme.colors.gold, '#FFF2CE', theme.colors.goldSoft],
      });
    } catch {
      // ignore
    }
  }

  const eventsList = [
    { id: 'mehndi', labelEn: 'Mehndi (12 Jan)', labelUr: 'مہندی — ۱۲ جنوری', color: theme.events.mehndi.accent },
    { id: 'baraat', labelEn: 'Baraat (13 Jan)', labelUr: 'بارات — ۱۳ جنوری', color: theme.events.baraat.accent },
    { id: 'waleema', labelEn: 'Waleema (14 Jan)', labelUr: 'ولیمہ — ۱۴ جنوری', color: theme.events.waleema.accent },
  ];
  const topEvents = eventsList.filter((e) => e.id === 'mehndi' || e.id === 'baraat');
  const waleemaEvent = eventsList.find((e) => e.id === 'waleema')!;

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 14,
    border: `1px solid ${RSVP_LINE}`,
    background: RSVP_FIELD,
    color: RSVP_INK,
    textAlign: 'center',
    fontSize: 16,
    outline: 'none',
    WebkitAppearance: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: isRtl ? 13 : 11,
    letterSpacing: isRtl ? '0.04em' : '0.14em',
    textTransform: isRtl ? 'none' : 'uppercase',
    color: theme.colors.goldSoft,
    marginBottom: 6,
    fontWeight: 600,
    fontFamily: isRtl ? "'Amiri', serif" : undefined,
    lineHeight: isRtl ? 1.7 : undefined,
    textAlign: 'center',
  };

  const eventBtnStyle = (on: boolean, color: string): React.CSSProperties => ({
    padding: '11px 12px',
    borderRadius: 12,
    border: on ? `1.5px solid ${color}` : `1px solid ${RSVP_LINE}`,
    background: on ? `${color}33` : RSVP_FIELD,
    color: RSVP_INK,
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: isRtl ? 13 : 13,
    minHeight: 42,
    fontFamily: isRtl ? "'Amiri', serif" : undefined,
  });

  return (
    <div
      className="rsvp rsvp-overlay"
      id="rsvp-section"
      style={{
        width: '100%',
        maxWidth: 400,
        maxHeight: 'min(92vh, 760px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        background: 'linear-gradient(180deg, rgba(26,10,14,0.94) 0%, rgba(14,5,8,0.96) 100%)',
        border: `1px solid ${RSVP_LINE}`,
        borderRadius: 22,
        boxShadow: '0 28px 70px rgba(0,0,0,0.5)',
        padding: '28px 20px max(28px, calc(env(safe-area-inset-bottom, 0px) + 18px))',
        color: RSVP_INK,
        overflowAnchor: 'none',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
        <p
          className="eyebrow"
          style={{
            color: theme.colors.goldSoft,
            letterSpacing: isRtl ? '0.1em' : '0.28em',
            marginBottom: 8,
            fontFamily: isRtl ? "'Amiri', serif" : undefined,
          }}
        >
          {isRtl ? 'آپ کی تشریف آوری' : 'R.S.V.P.'}
        </p>
        <h2
          style={{
            color: RSVP_INK,
            margin: '6px 0 10px',
            lineHeight: isRtl ? 1.7 : 1.15,
            fontFamily: isRtl ? "'Amiri', serif" : "'Cormorant Garamond', serif",
          }}
        >
          {submittedData
            ? isRtl
              ? (
                <>
                  شکریہ، عزیز مہمان
                  <em style={{ color: theme.colors.goldSoft, display: 'block', fontStyle: 'normal', fontSize: '0.78em', marginTop: 6 }}>
                    آپ کا جواب محفوظ ہو گیا
                  </em>
                </>
              )
              : (
                <>
                  Thank you, dear guest
                  <em style={{ color: theme.colors.goldSoft, display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: 4 }}>
                    Your response is saved
                  </em>
                </>
              )
            : isRtl
              ? (
                <>
                  کیا آپ تشریف لائیں گے؟
                  <em style={{ color: theme.colors.goldSoft, display: 'block', fontStyle: 'normal', fontSize: '0.78em', marginTop: 6 }}>
                    براہِ کرم اپنا جواب بھیجیں
                  </em>
                </>
              )
              : (
                <>
                  Will you join us?
                  <em style={{ color: theme.colors.goldSoft, display: 'block', fontStyle: 'italic', fontSize: '0.78em', marginTop: 4 }}>
                    A moment to confirm your presence
                  </em>
                </>
              )}
        </h2>
        <Ornament color={theme.colors.goldSoft} />

        {!submittedData ? (
          <form
            onSubmit={handleSubmit}
            autoComplete="on"
            style={{
              width: '100%',
              margin: '12px auto 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              textAlign: 'center',
              overflowAnchor: 'none',
            }}
          >
            <div>
              <label style={labelStyle}>{isRtl ? 'نام یا خاندانی نام' : 'YOUR NAME'} *</label>
              <input
                name="name"
                autoComplete="name"
                required
                value={guestName}
                onFocus={() => pauseSnapForTyping()}
                onChange={(e) => {
                  const next = e.target.value;
                  const burst = Math.abs(next.length - guestName.length) > 1;
                  pauseSnapForTyping();
                  setGuestName(next);
                  if (burst) pinScroll(1600);
                }}
                placeholder={isRtl ? 'اپنا نام...' : 'Enter your name...'}
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>{isRtl ? 'شرکت کی تصدیق' : 'WILL YOU ATTEND?'} *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['yes', 'no'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => chooseAttendance(val)}
                    style={{
                      padding: '12px 12px',
                      borderRadius: 14,
                      border:
                        response === val
                          ? `1.5px solid ${theme.colors.gold}`
                          : `1px solid ${RSVP_LINE}`,
                      background:
                        response === val
                          ? val === 'yes'
                            ? 'linear-gradient(135deg, #E0C075, #C6A15B)'
                            : 'rgba(184,116,116,0.28)'
                          : RSVP_FIELD,
                      color: response === val && val === 'yes' ? '#1A0A0E' : RSVP_INK,
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                      minHeight: 46,
                      fontFamily: isRtl ? "'Amiri', serif" : undefined,
                    }}
                  >
                    {val === 'yes'
                      ? isRtl
                        ? '✓ خوشی سے شرکت'
                        : '✓ Joyfully Attend'
                      : isRtl
                        ? '✕ معذرت'
                        : '✕ Regretfully Decline'}
                  </button>
                ))}
              </div>
            </div>

            {response === 'yes' && (
              <>
                <div>
                  <label style={labelStyle}>{isRtl ? 'مہمانوں کی تعداد' : 'NUMBER OF GUESTS'}</label>
                  <input
                    type="number"
                    name="guests"
                    inputMode="numeric"
                    autoComplete="off"
                    value={guestCount}
                    onFocus={() => pauseSnapForTyping()}
                    onChange={(e) => {
                      pauseSnapForTyping();
                      setGuestCount(e.target.value);
                    }}
                    placeholder="1"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: 8 }}>{isRtl ? 'تقریبات' : 'WHICH EVENTS?'}</label>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 8,
                        width: '100%',
                        maxWidth: 340,
                      }}
                    >
                      {topEvents.map((ev) => {
                        const on = selectedEvents.includes(ev.id);
                        return (
                          <button key={ev.id} type="button" onClick={() => toggleEvent(ev.id)} style={eventBtnStyle(on, ev.color)}>
                            {isRtl ? ev.labelUr : ev.labelEn}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleEvent(waleemaEvent.id)}
                      style={{
                        ...eventBtnStyle(selectedEvents.includes(waleemaEvent.id), waleemaEvent.color),
                        width: '100%',
                        maxWidth: 168,
                      }}
                    >
                      {isRtl ? waleemaEvent.labelUr : waleemaEvent.labelEn}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>{isRtl ? 'پیغام (اختیاری)' : 'A NOTE FOR THE COUPLE'}</label>
              <textarea
                name="message"
                autoComplete="off"
                value={guestMessage}
                onFocus={() => pauseSnapForTyping()}
                onChange={(e) => {
                  pauseSnapForTyping();
                  setGuestMessage(e.target.value);
                }}
                rows={2}
                placeholder={isRtl ? 'دعائیں یا پیغام...' : 'Optional dua or wishes...'}
                style={{ ...fieldStyle, resize: 'none' }}
              />
            </div>

            <p style={{ margin: '2px 0 0', color: RSVP_MUTED, fontSize: 12, lineHeight: 1.5 }}>
              {isRtl
                ? 'جواب محفوظ ہو جائے گا — بھیجنے کے لیے واٹس ایپ کا بٹن دبائیں'
                : 'Your reply is saved here. Send it on WhatsApp when you are ready.'}
            </p>

            <button
              type="submit"
              className="rsvp-submit"
              disabled={!response || !guestName.trim()}
              style={{
                marginTop: 4,
                marginBottom: 8,
                padding: '14px 20px',
                borderRadius: 999,
                border: 'none',
                background:
                  !response || !guestName.trim()
                    ? 'rgba(255,248,238,0.12)'
                    : `linear-gradient(135deg, ${theme.colors.goldSoft}, ${theme.colors.gold})`,
                color: !response || !guestName.trim() ? RSVP_MUTED : '#1A0A0E',
                fontWeight: 700,
                letterSpacing: '0.12em',
                cursor: !response || !guestName.trim() ? 'not-allowed' : 'pointer',
                minHeight: 48,
                boxShadow: '0 8px 22px rgba(0,0,0,0.28)',
                fontFamily: isRtl ? "'Amiri', serif" : undefined,
              }}
            >
              {isRtl ? 'جواب محفوظ کریں' : 'Confirm RSVP'}
            </button>
          </form>
        ) : (
          <div style={{ margin: '14px auto 0', textAlign: 'center' }}>
            <p style={{ color: RSVP_MUTED, fontSize: 14, lineHeight: 1.6, marginTop: 4 }}>
              {isRtl
                ? 'جواب بھیجنے کے لیے نیچے واٹس ایپ دبائیں'
                : 'Tap Send on WhatsApp to share your reply'}
            </p>
            <button
              type="button"
              onClick={() => sendToWhatsApp(submittedData)}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 24,
                border: 'none',
                background: '#25D366',
                color: '#fff',
                fontWeight: 700,
                marginTop: 10,
                cursor: 'pointer',
                minHeight: 48,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <WhatsAppIcon />
              {isRtl ? 'واٹس ایپ پر بھیجیں' : 'Send on WhatsApp'}
            </button>
            <button
              type="button"
              onClick={() => setSubmittedData(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.goldSoft,
                fontSize: 11,
                letterSpacing: '0.12em',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginTop: 12,
              }}
            >
              {isRtl ? 'جواب میں تبدیلی کریں' : 'Edit response'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
