import type { WeddingEvent } from '@/demos/aurora-safar/config/wedding';

/** Build a UTC ICS timestamp: YYYYMMDDTHHMMSSZ */
function toIcsUtc(date: string, hour: number, minute: number) {
  // Asia/Karachi is UTC+5 year-round (no DST).
  const utcHour = hour - 5;
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(utcHour, minute, 0, 0);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  return `${y}${m}${day}T${h}${min}00Z`;
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

/** Event start/end hours in Pakistan local time. */
function eventHours(e: WeddingEvent): { startH: number; startM: number; endH: number; endM: number } {
  if (e.id === 'mehndi') return { startH: 18, startM: 0, endH: 22, endM: 0 };
  return { startH: 19, startM: 0, endH: 22, endM: 0 };
}

export function buildEventIcs(e: WeddingEvent) {
  const { startH, startM, endH, endM } = eventHours(e);
  const dtStart = toIcsUtc(e.date, startH, startM);
  const dtEnd = toIcsUtc(e.date, endH, endM);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const location = [e.venue, e.address].filter(Boolean).join(', ');
  const uid = `${e.id}-${e.date}@aurora-safar`;
  const summary = `${e.name} — Ayaan & Zara`;
  const description = `${e.calendarDescription}\\n${e.message}\\n${location}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aurora Safar//Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeIcs(summary)} tomorrow`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${escapeIcs(summary)} in 2 hours`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Opens/downloads an .ics so iOS & Android offer the native calendar app. */
export function addEventToNativeCalendar(e: WeddingEvent) {
  const ics = buildEventIcs(e);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const filename = `${e.id}-ayaan-zara.ics`;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/i.test(ua);

  if (isIOS) {
    // iOS Safari opens Calendar from a same-tab .ics navigation.
    window.location.href = url;
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
