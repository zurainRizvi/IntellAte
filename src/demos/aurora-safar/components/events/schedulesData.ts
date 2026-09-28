export type ScheduleItem = {
  timeEn: string;
  timeUr: string;
  titleEn: string;
  titleUr: string;
  descEn: string;
  descUr: string;
  filled: boolean;
};

export const schedulesData: Record<'mehndi' | 'baraat' | 'waleema', {
  nameEn: string;
  nameUr: string;
  items: ScheduleItem[];
}> = {
  mehndi: {
    nameEn: 'Mehndi',
    nameUr: 'مہندی',
    items: [
      {
        timeEn: '06:00 PM',
        timeUr: 'شام ۶:۰۰',
        titleEn: 'Guest Arrival',
        titleUr: 'مہمانوں کی آمد',
        descEn: 'Welcome, greetings & refreshments',
        descUr: 'خوش آمدید، سلام و دعا اور ہلکا ناشتہ',
        filled: false,
      },
      {
        timeEn: '06:30 PM',
        timeUr: 'شام ۶:۳۰',
        titleEn: 'Nikkah',
        titleUr: 'نکاح',
        descEn: 'The sacred union begins with blessings',
        descUr: 'دعائوں کے ساتھ مقدس بندھن کا آغاز',
        filled: false,
      },
      {
        timeEn: '07:30 PM',
        timeUr: 'شام ۷:۳۰',
        titleEn: 'Mehndi Ceremony',
        titleUr: 'تقریبِ مہندی',
        descEn: 'An evening of colour, music and joyful beginnings',
        descUr: 'رنگ، موسیقی اور خوشیوں سے بھرپور آغاز',
        filled: true,
      },
      {
        timeEn: '08:00 PM',
        timeUr: 'رات ۸:۰۰',
        titleEn: 'Dinner',
        titleUr: 'کھانا',
        descEn: 'An evening of delicious food & laughter',
        descUr: 'لذیذ کھانا اور خوشگوار محفل',
        filled: false,
      },
      {
        timeEn: '09:00 – 10:00 PM',
        timeUr: 'رات ۹:۰۰ تا ۱۰:۰۰',
        titleEn: 'Celebration',
        titleUr: 'جشن',
        descEn: "Let's celebrate this beautiful union",
        descUr: 'اس پیارے بندھن کا خوشیوں بھرا جشن',
        filled: false,
      },
    ],
  },
  baraat: {
    nameEn: 'Baraat',
    nameUr: 'بارات',
    items: [
      {
        timeEn: '06:30 PM',
        timeUr: 'شام ۶:۳۰',
        titleEn: 'Guest Arrival',
        titleUr: 'مہمانوں کی آمد',
        descEn: 'Welcome drinks & warm greetings',
        descUr: 'خوش آمدیدی مشروبات اور پرتپاک استقبال',
        filled: false,
      },
      {
        timeEn: '07:00 PM',
        timeUr: 'شام ۷:۰۰',
        titleEn: 'Reception',
        titleUr: 'استقبالیہ',
        descEn: 'Welcoming the arrival of the Baraat & groom',
        descUr: 'بارات اور دولہا کی آمد کا شاندار استقبال',
        filled: true,
      },
      {
        timeEn: '08:00 PM',
        timeUr: 'رات ۸:۰۰',
        titleEn: 'Dinner',
        titleUr: 'کھانا',
        descEn: 'A royal feast of authentic delicacies & laughter',
        descUr: 'شاہانہ پکوان اور خوشیوں بھری ضیافت',
        filled: false,
      },
      {
        timeEn: '09:00 – 10:00 PM',
        timeUr: 'رات ۹:۰۰ تا ۱۰:۰۰',
        titleEn: 'Celebration',
        titleUr: 'جشن',
        descEn: 'Blessings, fond farewells & joyful celebration',
        descUr: 'دعائیں، الوداع اور خوشیوں بھرا اختتام',
        filled: false,
      },
    ],
  },
  waleema: {
    nameEn: 'Waleema',
    nameUr: 'ولیمہ',
    items: [
      {
        timeEn: '06:30 PM',
        timeUr: 'شام ۶:۳۰',
        titleEn: 'Guest Arrival',
        titleUr: 'مہمانوں کی آمد',
        descEn: 'Warm welcome & greetings to all beloved guests',
        descUr: 'پیارے مہمانوں کا پرتپاک استقبال',
        filled: false,
      },
      {
        timeEn: '07:00 PM',
        timeUr: 'شام ۷:۰۰',
        titleEn: 'Reception',
        titleUr: 'استقبالیہ',
        descEn: 'An elegant gathering beneath the moon',
        descUr: 'چاندنی میں ایک پُروقار محفل',
        filled: true,
      },
      {
        timeEn: '08:00 PM',
        timeUr: 'رات ۸:۰۰',
        titleEn: 'Dinner',
        titleUr: 'ولیمہ کا کھانا',
        descEn: 'Grand feast in celebration of the newlyweds',
        descUr: 'نو بیاہتا جوڑے کی خوشی میں ضیافت',
        filled: false,
      },
      {
        timeEn: '09:00 – 10:00 PM',
        timeUr: 'رات ۹:۰۰ تا ۱۰:۰۰',
        titleEn: 'Celebration',
        titleUr: 'جشن',
        descEn: 'Capturing memories & joyful celebration',
        descUr: 'یادگار لمحات اور پرمسرت جشن',
        filled: false,
      },
    ],
  },
};
