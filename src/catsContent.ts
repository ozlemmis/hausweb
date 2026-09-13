/* ════════════════════════════════════════════════════════════════
   CATS PAGE — ALL EDITABLE CONTENT LIVES IN THIS FILE
   ────────────────────────────────────────────────────────────────
   Nothing here is code you need to be careful with. Change any text
   between the quotes. Add or remove lines in a list. Save. Done.

   ADDING A PHOTO
   1. Drop the image into  src/assets/cats/   (e.g. boris.jpg)
   2. At the top of this file add:   import boris from './assets/cats/boris.jpg'
   3. Find the  photo: null  you want to fill and write  photo: boris
   Any  photo: null  shows a grey placeholder box, so nothing breaks.
   ════════════════════════════════════════════════════════════════ */

export type Photo = string | null;

/* ─── 01 · THE GANG ────────────────────────────────────────────── */

export const GANG_INTRO =
  "Here's all you need about the gang";

export const CATS = [
  {
    id: 'boris',
    name: 'Boris',
    nicknames: 'Uncle Boris · Börek · Grandpa Boris',
    color: '#E07B39',
    age: '17 years old',
    coat: 'Ginger, legs like chicken wings',
    oneLiner:
      'The lively grandpa of the house. Food is his religion and he will practice opera daily.',
    photo: null as Photo,
    traits: [
      'Dont take his loud meows personal, he may also meow to demand food.',
      'He has a metal paw -please be careful while holding him- and still climbs and runs like a teenager. Do not underestimate him.',
      'Sleeps on top of the heater, in the bathroom, and inside the bedroom closet — please leave those two doors open for him.',
      'Comes over for a cuddle, then gets going the second it becomes "too much love". He loves the balcony.',
      'First at the door to greet you. Also first to try and get through it.',
    ],
    loves: [
      'Thunfisch and lachs = wet food',
      'Gelenk paste licked straight off your finger in the morning.',
      'Anything that could conceivably be food, please dont give him anything else',
    ],
    avoid: [
      'Do not put the Gelenk in a bowl (he can lick bits from your finger happily). He eats it too fast and throws it back up.',
    ],
  },
  {
    id: 'chapo',
    name: 'Chapo',
    nicknames: 'Chapolino · Don Chapo · Chapito · Chapsky',
    color: '#3A3A3A',
    age: 'The teenager',
    coat: 'All black. A darkness with two eyes.',
    oneLiner:
      'Full battery, no off switch, but also the romantic one.',
    photo: null as Photo,
    traits: [
      'Redecorates overnight. Socks, blankets, the laser pointer — all relocated, none returned.',
      'Can open doors so please lock outside door.',
      'Sleeps on your neck when he feels close to you. He misses us the most when we are away, so he needs the most attention.',
      'Climbs on top of the entry closet to hide nap.',
    ],
    loves: [
      'Gourmet or Felix fish soups once a day',
      'The orange Denta snacks, as a reward after playing',
      'Playtime: The wand toy and your undivided attention',
    ],
    avoid: [
      'Sometimes he drinks the soup and leaves the meat behind — that is normal for him, not a worry',
      'He annoys Sora while he picks playful fight. If it stops sounding playful, break the fight up please.',
    ],
  },
  {
    id: 'sora',
    name: 'Sora',
    nicknames: 'Sora Maria · Sorito',
    color: '#6E7CA8',
    age: 'The evil mastermind',
    coat: 'Black and white, looks like a call center operator, the princess',
    oneLiner:
      'Picky about people. If she comes to you for rubs, you have genuinely been accepted.',
    photo: null as Photo,
    traits: [
      'She is rather distant. A purr from Sora is an achievement.',
      'Climbs onto shoulders and rides there. All 4.3 kg of her.',
      'Tips the water cup over if the water is not fresh. She has standards and she enforces them.',
      'Favourite spot: the bathroom window or bedroom window.',
      'Slaps other cats when she gets a chance.',
      'If she meows at you a lot, might be because she is missing playtime',
    ],
    loves: [
      'The wand toy — she waits her turn and then goes airborne',
      'Being brushed.',
      'Loves screens as you work',
    ],
    avoid: [
      'Do not force contact. Let her come to you and she will, eventually.',
    ],
  },
];

/* ─── 02 · A VISIT IN 5 STEPS ──────────────────────────────────── */

export const ROUTINE = {
  note: 'Roughly two visits a day — morning around 8:00, evening around 18:00. Nothing here is rigid, it is just what we do.',
  morning: [
    {
      title: 'Come in slowly',
      detail:
        'All three will be at the door, and all three will try their luck. Open it a crack first and check where everyone is.',
    },
    {
      title: 'Feed everyone',
      detail:
        'Wet food all round. Boris eats in the fireplace room so nobody raids his bowl. Top up the dry food jars on the counter if they look low.',
    },
    {
      title: 'Fresh water',
      detail:
        'Clean cup, fresh water, every visit. Sora will tip it over if it has been sitting.',
    },
    {
      title: 'Litter',
      detail:
        'Check the automatic box and add 2–3 purple cups of fresh sand on top.',
    },
    {
      title: 'Play, then a quick look around',
      detail:
        '10–15 minutes with the wand toy. Then: dishwasher shut, thermometer above 20°, nothing wet where it should be dry.',
    },
  ],
  evening: [
    {
      title: 'Same careful entrance',
      detail: 'They will be even more excited in the evening. Same door rule.',
    },
    {
      title: 'Feed — plus Chapo’s soup',
      detail:
        'Evening is when Chapo gets his soup with the calming drops. Once a day, evening only.',
    },
    {
      title: 'Fresh water again',
      detail: 'New cup, new water.',
    },
    {
      title: 'Litter check',
      detail: 'Quick check and top up the sand if it looks thin.',
    },
    {
      title: 'Play, brush, hang out',
      detail:
        'Brushing is the thing they love most in the world. Chapo especially needs tiring out or he will bother the other two all night.',
    },
  ],
  photosNote:
    'Photos and videos are always very welcome and never expected. We love them more than is reasonable.',
};

/* ─── 03 · FEEDING ─────────────────────────────────────────────── */

export const FEEDING = {
  rules: [
    {
      level: 'alert' as const,
      title: 'Chapo’s calming drops',
      text: '1–2 drops of Calma into Chapo’s soup. Evening visit only, once a day, never in the morning. The bottle lives in the fridge.',
    },
    {
      level: 'warn' as const,
      title: 'The Gelenk ritual (Boris)',
      text: 'His joint paste goes on your finger, not in a bowl. In a bowl he eats it far too fast and brings it straight back up.',
    },
    {
      level: 'info' as const,
      title: 'Boris eats separately',
      text: 'His bowl goes in the fireplace room. He is slow and the other two will help themselves otherwise.',
    },
    {
      level: 'info' as const,
      title: 'Boris is a critic',
      text: 'Thunfisch, huhn and lamm: yes. Carrot + salmon and plain lachs: he will leave it. Seelachs is always the safe bet. If he leaves the last dried-up bit, that is normal — it can wait until the next visit.',
    },
    {
      level: 'info' as const,
      title: 'Water',
      text: 'Fresh water and a clean cup every visit. Spare cups are in the cupboard. If one gets broken, the Restmüll bin is in the kitchen — and please do not worry about it, it happens constantly.',
    },
  ],
  whereItLives: [
    {
      label: 'Dry food',
      place: 'Kitchen counter',
      text: 'Three labelled jars. Refill them from the bags in the entry closet.',
      photo: null as Photo,
    },
    {
      label: 'Refill bags',
      place: 'Entry closet, hallway',
      text: 'Spare bags of all three dry foods are tucked away in here.',
      photo: null as Photo,
    },
    {
      label: 'Wet food, soups & snacks',
      place: 'Middle metal drawer, right of the oven',
      text: 'Everything in one place — tins, Felix soups, treats, licks, Denta snacks.',
      photo: null as Photo,
    },
    {
      label: 'Extra dry food',
      place: 'Metal drawer below that one',
      text: 'Unopened packages if the jars and the entry closet both run dry.',
      photo: null as Photo,
    },
    {
      label: 'Calma drops',
      place: 'Fridge',
      text: 'For Chapo’s evening soup only.',
      photo: null as Photo,
    },
  ],
};

/* ─── 04 · LITTER ──────────────────────────────────────────────── */

export const LITTER = {
  steps: [
    {
      title: 'The automatic box does the scooping',
      detail: 'Check it each visit. The bag changes from the right-hand side.',
    },
    {
      title: 'Top up the sand daily',
      detail:
        '2–3 purple cups of fresh sand on top of the automatic box, or the layer gets too thin to work.',
    },
    {
      title: 'There is a second, white box too',
      detail:
        'Boris uses that one. It is a comically tight fit for him and he does not care.',
    },
    {
      title: 'Sand on the floor',
      detail:
        'The sweeper lives in the bedroom. You know it is seated correctly when it actually sucks the sand in.',
    },
  ],
  rules: [
    {
      level: 'info' as const,
      title: 'Tell us before it runs out',
      text: 'We go through roughly one pack a week. A few days’ warning is enough for us to order more — deliveries go to the neighbour, so it takes a moment.',
    },
  ],
  whereItLives: [
    {
      label: 'Litter sacks',
      place: 'Hallway, under the plants',
      text: 'Please do not hesitate to add more, there is always plenty.',
      photo: null as Photo,
    },
    {
      label: 'Bags, cleaning supplies, kitchen paper',
      place: 'The thin cabinet in the hallway',
      text: 'Bin bags and everything else you might need is dumped in here.',
      photo: null as Photo,
    },
  ],
};

/* ─── 05 · PLAY & CUDDLES ──────────────────────────────────────── */

export const PLAY = {
  general: [
    {
      title: 'The wand is the favourite',
      detail:
        'The metal rod toy. They jump on and off the bed for it and it is the fastest way to tire Chapo out.',
    },
    {
      title: 'There is a spare',
      detail: 'Right at the back of the same drawer, if this one is worn out.',
    },
    {
      title: 'Laser: sparingly',
      detail:
        'Fine now and then, but not as the main event — there is nothing for them to actually catch at the end of it. Wand and plush toys first.',
    },
    {
      title: 'Brushing',
      detail:
        'Fifteen minutes of brushing and all three go completely soft. This is the single most appreciated thing you can do.',
    },
  ],
  perCat: [
    {
      catId: 'chapo',
      text: 'Needs a proper session or he takes it out on the other two at night. If he ignores the toy, walk into another room with it — he will follow.',
    },
    {
      catId: 'sora',
      text: 'Waits her turn and then goes airborne. Watch your face at the end of the wand.',
    },
    {
      catId: 'boris',
      text: 'Watches from a distance and joins in when the others let him. Give him his moment in the spotlight.',
    },
  ],
  whereItLives: [
    {
      label: 'Toy drawer',
      place: 'Under the TV — third cabinet from the left, second drawer down',
      text: 'The wand, the plush toys and the laser all live here.',
      photo: null as Photo,
    },
  ],
};

/* ─── 06 · HOUSE QUIRKS & SAFETY ───────────────────────────────── */

export const HOUSE = {
  intro:
    'None of this is a rule. It is just the list of things that have surprised us, so that nothing surprises you.',
  warnings: [
    {
      level: 'alert' as const,
      title: 'The front door',
      text: 'All three try to escape. Chapo and Boris are the fastest and Sora has had a go too. Open slowly and know where everyone is before you leave.',
    },
    {
      level: 'alert' as const,
      title: 'The kitchen tap',
      text: 'Do not pull the flexible hose out too far. It catches on the pipe underneath, the pipe drops, and the kitchen floods. Moving it left and right is completely fine.',
    },
    {
      level: 'warn' as const,
      title: 'Dishwasher door',
      text: 'It sits slightly open after a wash and they climb on it. If you find it ajar, push it shut.',
    },
    {
      level: 'warn' as const,
      title: 'Bathroom window',
      text: 'In heavy rain water comes in through the gap. Make sure it is fully closed if a storm is coming.',
    },
    {
      level: 'warn' as const,
      title: 'Windows and balcony',
      text: 'Only the net windows and the balcony door get opened, and only while someone is there.',
    },
    {
      level: 'warn' as const,
      title: 'Heating',
      text: 'Old building, it has broken on us before. There is a digital thermometer next to the kitchen counter on the wooden beam. It should read 20° or above.',
    },
    {
      level: 'info' as const,
      title: 'Chapo’s climbing route',
      text: 'He gets on top of the entry closet to hide, but he shoves the white box further right as he climbs and then cannot reach. If you see it pushed out, nudge it back in.',
    },
    {
      level: 'info' as const,
      title: 'Doors to leave open',
      text: 'The bathroom door and the bedroom closet. Boris sleeps in both.',
    },
    {
      level: 'info' as const,
      title: 'The lights are not haunted',
      text: 'Some of them switch themselves on and off on a timer. Do not be alarmed.',
    },
    {
      level: 'info' as const,
      title: 'Balcony umbrella',
      text: 'If it gets windy, tuck it under the bench so it does not fly off.',
    },
  ],
  plants: {
    title: 'Plants',
    text: 'About twice a week, roughly a cup each. The little ones by the door and in the kitchen just need a splash. The ones in the study are the dramatic ones — they go first and they go fast.',
    photo: null as Photo,
  },
  packages: {
    title: 'Parcels',
    text: 'Deliveries go to Eugen on the second floor. If something has been delivered and it is not at the door, that is where it is.',
  },
  comfort: {
    title: 'Please make yourself at home',
    lines: [
      'Coffee, tea, Netflix and Amazon Prime are all yours. So are the books.',
      'The cats love the balcony open when there is a human around. They will happily sit out there with you for hours.',
      'There are blankets and sheets by the door if you want to get comfortable.',
      'Stay as long as you like. We mean it.',
    ],
  },
};

/* ─── 07 · EMERGENCY & CONTACTS ────────────────────────────────── */

export const CONTACTS = {
  people: [
    {
      name: 'Özlem',
      role: 'Cat mum',
      lines: ['WhatsApp — fastest', 'Work phone as backup, always on me'],
      phone: '',
    },
    {
      name: 'Job',
      role: 'Cat dad',
      lines: ['WhatsApp'],
      phone: '',
    },
  ],
  vet: {
    title: 'Vet',
    regular:
      'We use Felmo for routine visits — a mobile vet that comes to the flat. Felmo is not an emergency service and cannot come at short notice.',
    emergency:
      'If something is urgent: message or call us first. We will find an emergency vet in the neighbourhood straight away, wherever we are. If you cannot reach us within a few minutes, go to the nearest Tierklinik and we will sort out everything else afterwards.',
    clinic: '— add your nearest 24h Tierklinik here —',
  },
  neighbour: {
    title: 'Neighbour',
    text: 'Eugen, second floor. He takes our parcels and is easy to ask if something needs a second pair of hands.',
  },
  address: '— add the flat address here —',
  closing:
    'Thank you. Genuinely. Knowing they are with someone who likes them is the only reason we can actually relax while we are away.',
};
