export type SingleEventId =
  | "ember-year"
  | "first-light"
  | "lullaby-moon"
  | "laureate-dusk"
  | "silver-thread";

export type SingleEventTheme = {
  id: SingleEventId;
  title: string;
  occasionLabel: string;
  hostLine: string;
  names: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  city: string;
  message: string;
  farewell: string;
  tapHint: string;
  rsvpTitle: string;
  countdownLabel: string;
  /** ISO date for countdown target */
  targetDate: string;
  colors: {
    page: string;
    pageDeep: string;
    card: string;
    ink: string;
    inkSoft: string;
    muted: string;
    accent: string;
    accentSoft: string;
    wash: string;
    curtain: string;
  };
};
