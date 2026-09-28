export type EventId = 'mehndi' | 'baraat' | 'waleema';
export type WeddingEvent = {
  id: EventId;
  name: string;
  subtitle: string;
  date: string;
  day: string;
  time: string;
  venue: string;
  address: string;
  dressCode: string;
  message: string;
  mapUrl: string;
  calendarDescription: string;
};
export const wedding = {
  couple: { groom: 'Ayaan', bride: 'Zara', initials: 'AZ' },
  families: ["Ayaan's Family", "Zara's Family"],
  monthYear: 'January 2027',
  countdownTarget: '2027-01-12T18:00:00+05:00',
  invitation: {
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
    greeting: 'Assalam-o-Alaikum',
    wording: 'Request the pleasure of your company at their wedding celebrations.',
    dua: 'May Allah bless this union with tranquillity, affection, mercy and a lifetime of companionship.',
    verseArabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    verseMeaningEn:
      'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us an example for the righteous.',
    verseMeaningUr:
      'اے ہمارے رب! ہمیں ہماری بیویوں اور اولاد کی طرف سے آنکھوں کی ٹھنڈک عطا فرما، اور ہمیں پرہیزگاروں کا امام بنا دے۔',
    verseReferenceEn: 'Surah Al-Furqan · 25:74',
    verseReferenceUr: 'سورۃ الفرقان · ۲۵:۷۴',
  },
  events: [
    {
      id: 'mehndi',
      name: 'Mehndi',
      subtitle: 'The Garden of Colour',
      date: '2027-01-12',
      day: 'Tuesday',
      time: '6:00 – 10:00 PM',
      venue: 'Supreme Marquee',
      address: '',
      dressCode: 'Traditional & Colourful',
      message: 'An evening of colour, music, laughter and joyful beginnings.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Supreme+Marquee+Lahore',
      calendarDescription: 'Ayaan and Zara — Mehndi celebration',
    },
    {
      id: 'baraat',
      name: 'Baraat',
      subtitle: 'The Royal Passage',
      date: '2027-01-13',
      day: 'Wednesday',
      time: '7:00 – 10:00 PM',
      venue: 'Seven Star Event Complex',
      address: 'Hall No. 2',
      dressCode: 'Formal & Traditional',
      message: 'A regal celebration of family, tradition and a new beginning.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Seven+Star+Event+Complex+Lahore',
      calendarDescription: 'Ayaan and Zara — Baraat celebration · Hall No. 2',
    },
    {
      id: 'waleema',
      name: 'Waleema',
      subtitle: 'The Moonlit Celebration',
      date: '2027-01-14',
      day: 'Thursday',
      time: '7:00 – 10:00 PM',
      venue: 'Viceroy by Mughal e Azam',
      address: 'Hall No. 1',
      dressCode: 'Elegant & Modest',
      message: 'A graceful evening beneath the moon, shared with those we cherish.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Viceroy+by+Mughal+e+Azam+Lahore',
      calendarDescription: 'Ayaan and Zara — Waleema celebration · Hall No. 1',
    },
  ] satisfies WeddingEvent[],
  story: [],
  gallery: [],
  whatsapp: {
    /** Preview demos never ship a personal number — IntellAte business WhatsApp is configured separately. */
    contactNumber: '',
    shareMessage: "You are warmly invited to Ayaan and Zara's wedding celebrations in Lahore, January 2027.",
  },
  rsvp: { deadline: '2026-12-20' },
  musicPath: '/demos/aurora-safar/audio/islamic-calm.mp3',
  social: {
    title: 'Aurora Safar — Ayaan & Zara',
    description: 'A journey illuminated by light. Lahore · January 2027.',
    image: '/demos/aurora-safar/social-preview.svg',
    themeColor: '#F7F1E8',
  },
  sections: { story: false, gallery: false, rsvp: false },
} as const;
