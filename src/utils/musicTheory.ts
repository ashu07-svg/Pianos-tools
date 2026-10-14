export type NoteName =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B';

export const CHROMATIC_SHARP: NoteName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

export const CHROMATIC_FLAT: NoteName[] = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

export const ENHARMONIC_MAP: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
};

export function normalizeNote(note: string): NoteName {
  const clean = note.trim();
  const base = clean.slice(0, 2).replace('/', '');
  if (CHROMATIC_SHARP.includes(base as NoteName)) return base as NoteName;
  if (CHROMATIC_FLAT.includes(base as NoteName)) return base as NoteName;
  const single = clean.charAt(0).toUpperCase();
  if (CHROMATIC_SHARP.includes(single as NoteName)) return single as NoteName;
  return 'C';
}

export function noteToSemitone(note: string): number {
  const norm = normalizeNote(note);
  const sharpIndex = CHROMATIC_SHARP.indexOf(norm);
  if (sharpIndex !== -1) return sharpIndex;
  const flatIndex = CHROMATIC_FLAT.indexOf(norm);
  if (flatIndex !== -1) return flatIndex;
  return 0;
}

export function semitoneToNote(semitone: number, preferFlat = false): NoteName {
  const mod = ((semitone % 12) + 12) % 12;
  return preferFlat ? CHROMATIC_FLAT[mod] : CHROMATIC_SHARP[mod];
}

export interface ScaleDefinition {
  id: string;
  name: string;
  category: 'Major Modes' | 'Minor & Blues' | 'Jazz & Bebop' | 'Exotic & World';
  intervals: number[]; // semitone offsets from root
  degreeNames: string[]; // e.g. ['1', '2', '3', '4', '5', '6', '7']
  stepPattern: string; // e.g. "W-W-H-W-W-W-H"
  description: string;
  mood: string;
  suggestedChords: string[];
}

export const SCALES: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Major (Ionian)',
    category: 'Major Modes',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degreeNames: ['1', '2', '3', '4', '5', '6', '7'],
    stepPattern: 'W-W-H-W-W-W-H',
    description: 'The cornerstone of Western music theory. Bright, triumphant, and resolute.',
    mood: 'Joyful, uplifting, stable, pure',
    suggestedChords: ['maj7', 'add9', 'maj9', 'sus4'],
  },
  {
    id: 'dorian',
    name: 'Dorian Mode',
    category: 'Major Modes',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degreeNames: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    stepPattern: 'W-H-W-W-W-H-W',
    description: 'Minor scale with a raised 6th degree. The quintessential jazz, funk, and Celtic mode.',
    mood: 'Soulful, contemplative, melancholic yet hopeful',
    suggestedChords: ['m7', 'm9', 'm11', '7sus4'],
  },
  {
    id: 'phrygian',
    name: 'Phrygian Mode',
    category: 'Major Modes',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degreeNames: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    stepPattern: 'H-W-W-W-H-W-W',
    description: 'Minor scale with an ominous flat 2nd. Found in flamenco, metal, and film scores.',
    mood: 'Exotic, dark, intense, suspenseful',
    suggestedChords: ['m7', 'bII', 'm7b9'],
  },
  {
    id: 'lydian',
    name: 'Lydian Mode',
    category: 'Major Modes',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degreeNames: ['1', '2', '3', '#4', '5', '6', '7'],
    stepPattern: 'W-W-W-H-W-W-H',
    description: 'Major scale with an ethereal raised 4th (sharp 4). Beloved by cinematic composers.',
    mood: 'Dreamy, ethereal, celestial, wonderous',
    suggestedChords: ['maj7#11', 'maj9', 'add#11'],
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Mode',
    category: 'Major Modes',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degreeNames: ['1', '2', '3', '4', '5', '6', 'b7'],
    stepPattern: 'W-W-H-W-W-H-W',
    description: 'Major scale with a dominant flat 7th. Foundation of classic rock, blues, and country.',
    mood: 'Bluesy, driving, swaggering, earthy',
    suggestedChords: ['7', '9', '13', '7sus4'],
  },
  {
    id: 'minor',
    name: 'Natural Minor (Aeolian)',
    category: 'Minor & Blues',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degreeNames: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    stepPattern: 'W-H-W-W-H-W-W',
    description: 'The standard minor scale. Found across classical, pop ballads, and tragic themes.',
    mood: 'Somber, poignant, introspective, dramatic',
    suggestedChords: ['m', 'm7', 'm9', 'm11'],
  },
  {
    id: 'locrian',
    name: 'Locrian Mode',
    category: 'Major Modes',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degreeNames: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    stepPattern: 'H-W-W-H-W-W-W',
    description: 'Diminished tonic triad with flat 2nd and flat 5th. Highly unstable and restless.',
    mood: 'Tense, ominous, ungrounded, unstable',
    suggestedChords: ['m7b5', 'dim7'],
  },
  {
    id: 'harmonic_minor',
    name: 'Harmonic Minor',
    category: 'Minor & Blues',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degreeNames: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    stepPattern: 'W-H-W-W-H-1.5-H',
    description: 'Minor scale with a raised natural 7th leading tone. Features an augmented 2nd interval.',
    mood: 'Dramatic, Middle Eastern, neoclassical, baroque',
    suggestedChords: ['m(maj7)', 'dim7', 'V7b9'],
  },
  {
    id: 'melodic_minor',
    name: 'Melodic Minor (Jazz Minor)',
    category: 'Jazz & Bebop',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degreeNames: ['1', '2', 'b3', '4', '5', '6', '7'],
    stepPattern: 'W-H-W-W-W-W-H',
    description: 'Minor with natural 6th and 7th. Generates modern jazz modes like Altered and Lydian Dominant.',
    mood: 'Sophisticated, modern, fluid, unresolved richness',
    suggestedChords: ['m(maj7)', 'm6', 'm9', 'alt7'],
  },
  {
    id: 'pentatonic_major',
    name: 'Major Pentatonic',
    category: 'Minor & Blues',
    intervals: [0, 2, 4, 7, 9],
    degreeNames: ['1', '2', '3', '5', '6'],
    stepPattern: 'W-W-1.5-W-1.5',
    description: '5-note scale without dissonant semitones. Versatile across country, rock, and folk.',
    mood: 'Bright, sweet, harmonious, open',
    suggestedChords: ['maj', 'add9', '6'],
  },
  {
    id: 'pentatonic_minor',
    name: 'Minor Pentatonic',
    category: 'Minor & Blues',
    intervals: [0, 3, 5, 7, 10],
    degreeNames: ['1', 'b3', '4', '5', 'b7'],
    stepPattern: '1.5-W-W-1.5-W',
    description: 'The backbone of rock, blues, and pop guitar solos. Never clashes over minor or blues.',
    mood: 'Gritty, expressive, soulful, punchy',
    suggestedChords: ['m7', 'm', '7'],
  },
  {
    id: 'blues',
    name: 'Blues Scale (Hexatonic)',
    category: 'Minor & Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    degreeNames: ['1', 'b3', '4', 'b5', '5', 'b7'],
    stepPattern: '1.5-W-H-H-1.5-W',
    description: 'Minor pentatonic with the legendary diminished 5th "blue note" added.',
    mood: 'Raw, emotive, cry-like, rebellious',
    suggestedChords: ['7', '7#9', 'm7'],
  },
  {
    id: 'bebop_dominant',
    name: 'Bebop Dominant',
    category: 'Jazz & Bebop',
    intervals: [0, 2, 4, 5, 7, 9, 10, 11],
    degreeNames: ['1', '2', '3', '4', '5', '6', 'b7', '7'],
    stepPattern: 'W-W-H-W-W-H-H-H',
    description: '8-note scale engineered by Charlie Parker & Dizzy Gillespie to keep chord tones on downbeats.',
    mood: 'Swinging, kinetic, virtuosic, fluid',
    suggestedChords: ['7', '9', '13'],
  },
  {
    id: 'whole_tone',
    name: 'Whole Tone',
    category: 'Jazz & Bebop',
    intervals: [0, 2, 4, 6, 8, 10],
    degreeNames: ['1', '2', '3', '#4', '#5', 'b7'],
    stepPattern: 'W-W-W-W-W-W',
    description: 'Symmetrical 6-tone scale composed entirely of whole steps. Debussy dreamscapes.',
    mood: 'Floating, surreal, dreamlike, weightless',
    suggestedChords: ['aug', '7#5', '9#5'],
  },
  {
    id: 'diminished_hw',
    name: 'Half-Whole Diminished',
    category: 'Jazz & Bebop',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    degreeNames: ['1', 'b2', '#2', '3', '#4', '5', '6', 'b7'],
    stepPattern: 'H-W-H-W-H-W-H-W',
    description: 'Symmetrical 8-tone scale played over dominant 7th flat-9 or altered chords in jazz.',
    mood: 'Complex, biting, polytonal, electrifying',
    suggestedChords: ['7b9', '7#9', '13b9'],
  },
  {
    id: 'hungarian_minor',
    name: 'Hungarian Minor (Gypsy)',
    category: 'Exotic & World',
    intervals: [0, 2, 3, 6, 7, 8, 11],
    degreeNames: ['1', '2', 'b3', '#4', '5', 'b6', '7'],
    stepPattern: 'W-H-1.5-H-H-1.5-H',
    description: 'Double harmonic minor variant featuring two augmented second intervals.',
    mood: 'Haunting, romantic, fiery, virtuosic',
    suggestedChords: ['m(maj7)', 'dim7', 'IV#'],
  },
  {
    id: 'hirajoshi',
    name: 'Japanese Hirajoshi',
    category: 'Exotic & World',
    intervals: [0, 2, 3, 7, 8],
    degreeNames: ['1', '2', 'b3', '5', 'b6'],
    stepPattern: 'W-H-2W-H-2W',
    description: 'Traditional Japanese pentatonic scale used for Shamisen and Koto music.',
    mood: 'Serene, ancient, meditative, poignant',
    suggestedChords: ['m', 'm(add9)'],
  },
  {
    id: 'arabic_hijaz',
    name: 'Arabic Hijaz / Phrygian Dominant',
    category: 'Exotic & World',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    degreeNames: ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
    stepPattern: 'H-1.5-H-W-H-W-W',
    description: '5th mode of Harmonic Minor. Central to Middle Eastern Maqam Hijaz, Flamenco, and Klezmer.',
    mood: 'Mystical, radiant, passionate, ancient',
    suggestedChords: ['7b9', 'maj', 'm'],
  },
];

export interface ChordDefinition {
  id: string;
  name: string;
  symbol: string;
  category: 'Triads' | 'Seventh Chords' | 'Extended Chords' | 'Altered & Suspended';
  intervals: number[]; // semitones relative to root
  formula: string; // e.g. "1 - 3 - 5 - b7"
  degreeLabels: string[];
  description: string;
  colorClass: string;
}

export const CHORDS: ChordDefinition[] = [
  {
    id: 'major',
    name: 'Major Triad',
    symbol: '',
    category: 'Triads',
    intervals: [0, 4, 7],
    formula: '1 - 3 - 5',
    degreeLabels: ['1', '3', '5'],
    description: 'Consonant and harmonious. The primary pillar of Western tonality.',
    colorClass: 'emerald',
  },
  {
    id: 'minor',
    name: 'Minor Triad',
    symbol: 'm',
    category: 'Triads',
    intervals: [0, 3, 7],
    formula: '1 - b3 - 5',
    degreeLabels: ['1', 'b3', '5'],
    description: 'Dark, melancholic, and introspective sound with a minor third.',
    colorClass: 'blue',
  },
  {
    id: 'diminished',
    name: 'Diminished Triad',
    symbol: 'dim',
    category: 'Triads',
    intervals: [0, 3, 6],
    formula: '1 - b3 - b5',
    degreeLabels: ['1', 'b3', 'b5'],
    description: 'Unstable and dissonant with a tritone between root and flat-5.',
    colorClass: 'amber',
  },
  {
    id: 'augmented',
    name: 'Augmented Triad',
    symbol: 'aug',
    category: 'Triads',
    intervals: [0, 4, 8],
    formula: '1 - 3 - #5',
    degreeLabels: ['1', '3', '#5'],
    description: 'Dreamy and ambiguous symmetry composed of two major thirds.',
    colorClass: 'purple',
  },
  {
    id: 'sus2',
    name: 'Suspended 2nd',
    symbol: 'sus2',
    category: 'Altered & Suspended',
    intervals: [0, 2, 7],
    formula: '1 - 2 - 5',
    degreeLabels: ['1', '2', '5'],
    description: 'Open, airy, and unresolved. Replaces the third with a major second.',
    colorClass: 'cyan',
  },
  {
    id: 'sus4',
    name: 'Suspended 4th',
    symbol: 'sus4',
    category: 'Altered & Suspended',
    intervals: [0, 5, 7],
    formula: '1 - 4 - 5',
    degreeLabels: ['1', '4', '5'],
    description: 'Classic tension chord yearning to resolve downward to the major third.',
    colorClass: 'teal',
  },
  {
    id: 'maj7',
    name: 'Major 7th',
    symbol: 'maj7',
    category: 'Seventh Chords',
    intervals: [0, 4, 7, 11],
    formula: '1 - 3 - 5 - 7',
    degreeLabels: ['1', '3', '5', '7'],
    description: 'Lush, warm, and sophisticated. The signature sound of jazz and bossa nova.',
    colorClass: 'indigo',
  },
  {
    id: 'dom7',
    name: 'Dominant 7th',
    symbol: '7',
    category: 'Seventh Chords',
    intervals: [0, 4, 7, 10],
    formula: '1 - 3 - 5 - b7',
    degreeLabels: ['1', '3', '5', 'b7'],
    description: 'Dynamic blues and functional harmonic powerhouse containing a tritone.',
    colorClass: 'orange',
  },
  {
    id: 'min7',
    name: 'Minor 7th',
    symbol: 'm7',
    category: 'Seventh Chords',
    intervals: [0, 3, 7, 10],
    formula: '1 - b3 - 5 - b7',
    degreeLabels: ['1', 'b3', '5', 'b7'],
    description: 'Smooth, relaxed, and mellow. The staple of neo-soul, R&B, and jazz.',
    colorClass: 'sky',
  },
  {
    id: 'm7b5',
    name: 'Half-Diminished',
    symbol: 'm7b5',
    category: 'Seventh Chords',
    intervals: [0, 3, 6, 10],
    formula: '1 - b3 - b5 - b7',
    degreeLabels: ['1', 'b3', 'b5', 'b7'],
    description: 'The critical ii chord in minor key ii-V-i cadences.',
    colorClass: 'rose',
  },
  {
    id: 'dim7',
    name: 'Diminished 7th',
    symbol: 'dim7',
    category: 'Seventh Chords',
    intervals: [0, 3, 6, 9],
    formula: '1 - b3 - b5 - bb7',
    degreeLabels: ['1', 'b3', 'b5', 'bb7'],
    description: 'Fully symmetrical stack of minor thirds. Can resolve in 4 directions.',
    colorClass: 'red',
  },
  {
    id: 'm_maj7',
    name: 'Minor-Major 7th',
    symbol: 'm(maj7)',
    category: 'Seventh Chords',
    intervals: [0, 3, 7, 11],
    formula: '1 - b3 - 5 - 7',
    degreeLabels: ['1', 'b3', '5', '7'],
    description: 'Famous as the "James Bond spy chord". Eerie, mysterious, and noir.',
    colorClass: 'violet',
  },
  {
    id: 'add9',
    name: 'Added 9th',
    symbol: 'add9',
    category: 'Extended Chords',
    intervals: [0, 4, 7, 14],
    formula: '1 - 3 - 5 - 9',
    degreeLabels: ['1', '3', '5', '9'],
    description: 'Glistening pop and acoustic guitar favorite with an added ninth tone.',
    colorClass: 'emerald',
  },
  {
    id: 'maj9',
    name: 'Major 9th',
    symbol: 'maj9',
    category: 'Extended Chords',
    intervals: [0, 4, 7, 11, 14],
    formula: '1 - 3 - 5 - 7 - 9',
    degreeLabels: ['1', '3', '5', '7', '9'],
    description: 'Sparkling, expansive, and velvet-smooth harmony.',
    colorClass: 'indigo',
  },
  {
    id: 'min9',
    name: 'Minor 9th',
    symbol: 'm9',
    category: 'Extended Chords',
    intervals: [0, 3, 7, 10, 14],
    formula: '1 - b3 - 5 - b7 - 9',
    degreeLabels: ['1', 'b3', '5', 'b7', '9'],
    description: 'Sensual, late-night jazz club and lo-fi hip-hop essential.',
    colorClass: 'blue',
  },
  {
    id: 'dom9',
    name: 'Dominant 9th',
    symbol: '9',
    category: 'Extended Chords',
    intervals: [0, 4, 7, 10, 14],
    formula: '1 - 3 - 5 - b7 - 9',
    degreeLabels: ['1', '3', '5', 'b7', '9'],
    description: 'Funky, rich dominant chord used heavily in James Brown and gospel.',
    colorClass: 'amber',
  },
  {
    id: 'hendrix_7sharp9',
    name: '7#9 (Hendrix Chord)',
    symbol: '7#9',
    category: 'Altered & Suspended',
    intervals: [0, 4, 7, 10, 15],
    formula: '1 - 3 - 5 - b7 - #9',
    degreeLabels: ['1', '3', '5', 'b7', '#9'],
    description: 'Made famous in Purple Haze. Combines a major 3rd and a sharp-9 (enharmonic minor 3rd).',
    colorClass: 'purple',
  },
  {
    id: 'dom7b9',
    name: '7b9 Altered',
    symbol: '7b9',
    category: 'Altered & Suspended',
    intervals: [0, 4, 7, 10, 13],
    formula: '1 - 3 - 5 - b7 - b9',
    degreeLabels: ['1', '3', '5', 'b7', 'b9'],
    description: 'Tense dominant chord that smoothly resolves into minor tonic chords.',
    colorClass: 'red',
  },
  {
    id: 'maj13',
    name: 'Major 13th',
    symbol: 'maj13',
    category: 'Extended Chords',
    intervals: [0, 4, 7, 11, 14, 21],
    formula: '1 - 3 - 5 - 7 - 9 - 13',
    degreeLabels: ['1', '3', '5', '7', '9', '13'],
    description: 'Ultra-rich modern jazz harmony spanning root through the 13th extension.',
    colorClass: 'fuchsia',
  },
];

export interface GuitarTuning {
  id: string;
  name: string;
  instrument: 'guitar' | 'bass';
  strings: { note: NoteName; octave: number }[]; // high to low order
}

export const GUITAR_TUNINGS: GuitarTuning[] = [
  {
    id: 'standard',
    name: 'Guitar: Standard (EADGBE)',
    instrument: 'guitar',
    strings: [
      { note: 'E', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'E', octave: 2 },
    ],
  },
  {
    id: 'drop_d',
    name: 'Guitar: Drop D (DADGBE)',
    instrument: 'guitar',
    strings: [
      { note: 'E', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'D', octave: 2 },
    ],
  },
  {
    id: 'dadgad',
    name: 'Guitar: DADGAD Celtic',
    instrument: 'guitar',
    strings: [
      { note: 'D', octave: 4 },
      { note: 'A', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'A', octave: 2 },
      { note: 'D', octave: 2 },
    ],
  },
  {
    id: 'open_g',
    name: 'Guitar: Open G (DGDGBD)',
    instrument: 'guitar',
    strings: [
      { note: 'D', octave: 4 },
      { note: 'B', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'D', octave: 3 },
      { note: 'G', octave: 2 },
      { note: 'D', octave: 2 },
    ],
  },
  {
    id: 'bass_4',
    name: 'Bass: Standard 4-String (EADG)',
    instrument: 'bass',
    strings: [
      { note: 'G', octave: 2 },
      { note: 'D', octave: 2 },
      { note: 'A', octave: 1 },
      { note: 'E', octave: 1 },
    ],
  },
];

export interface CircleKey {
  major: NoteName;
  minor: NoteName;
  sharps: number;
  flats: number;
  keySignature: string;
  degreeInC: string;
}

export const CIRCLE_OF_FIFTHS: CircleKey[] = [
  { major: 'C', minor: 'A', sharps: 0, flats: 0, keySignature: 'Natural', degreeInC: 'I' },
  { major: 'G', minor: 'E', sharps: 1, flats: 0, keySignature: '1 Sharp (F#)', degreeInC: 'V' },
  { major: 'D', minor: 'B', sharps: 2, flats: 0, keySignature: '2 Sharps (F#, C#)', degreeInC: 'II' },
  { major: 'A', minor: 'F#', sharps: 3, flats: 0, keySignature: '3 Sharps (F#, C#, G#)', degreeInC: 'VI' },
  { major: 'E', minor: 'C#', sharps: 4, flats: 0, keySignature: '4 Sharps (F#, C#, G#, D#)', degreeInC: 'III' },
  { major: 'B', minor: 'G#', sharps: 5, flats: 0, keySignature: '5 Sharps (F#, C#, G#, D#, A#)', degreeInC: 'VII' },
  { major: 'F#', minor: 'D#', sharps: 6, flats: 0, keySignature: '6 Sharps / 6 Flats (Gb/Ebm)', degreeInC: '#IV / bV' },
  { major: 'Db', minor: 'Bb', sharps: 0, flats: 5, keySignature: '5 Flats (Bb, Eb, Ab, Db, Gb)', degreeInC: 'bII' },
  { major: 'Ab', minor: 'F', sharps: 0, flats: 4, keySignature: '4 Flats (Bb, Eb, Ab, Db)', degreeInC: 'bVI' },
  { major: 'Eb', minor: 'C', sharps: 0, flats: 3, keySignature: '3 Flats (Bb, Eb, Ab)', degreeInC: 'bIII' },
  { major: 'Bb', minor: 'G', sharps: 0, flats: 2, keySignature: '2 Flats (Bb, Eb)', degreeInC: 'bVII' },
  { major: 'F', minor: 'D', sharps: 0, flats: 1, keySignature: '1 Flat (Bb)', degreeInC: 'IV' },
];

export interface PresetProgression {
  id: string;
  name: string;
  genre: string;
  description: string;
  romanNumerals: string[];
  chordsInC: { root: NoteName; chordId: string; label: string }[];
}

export const PRESET_PROGRESSIONS: PresetProgression[] = [
  {
    id: 'jazz_ii_v_i',
    name: 'Major ii - V - I Turnaround',
    genre: 'Jazz / Standards',
    description: 'The most important cadence in jazz harmony. Drives smoothly to resolution.',
    romanNumerals: ['ii7', 'V7', 'Imaj7'],
    chordsInC: [
      { root: 'D', chordId: 'min7', label: 'Dm7' },
      { root: 'G', chordId: 'dom7', label: 'G7' },
      { root: 'C', chordId: 'maj7', label: 'Cmaj7' },
    ],
  },
  {
    id: 'pop_4_chord',
    name: 'Pop Anthem (I - V - vi - IV)',
    genre: 'Pop / Rock / Folk',
    description: 'The famous "Axis of Awesome" 4-chord sequence behind hundreds of global radio hits.',
    romanNumerals: ['I', 'V', 'vi', 'IV'],
    chordsInC: [
      { root: 'C', chordId: 'major', label: 'C' },
      { root: 'G', chordId: 'major', label: 'G' },
      { root: 'A', chordId: 'minor', label: 'Am' },
      { root: 'F', chordId: 'major', label: 'F' },
    ],
  },
  {
    id: 'minor_ii_v_i',
    name: 'Minor iiø7 - V7alt - i',
    genre: 'Bossa Nova / Jazz Noir',
    description: 'Dark, expressive minor cadence featuring half-diminished and altered dominants.',
    romanNumerals: ['iiø7', 'V7(b9)', 'im7'],
    chordsInC: [
      { root: 'D', chordId: 'm7b5', label: 'Dm7b5' },
      { root: 'G', chordId: 'dom7b9', label: 'G7b9' },
      { root: 'C', chordId: 'min7', label: 'Cm7' },
    ],
  },
  {
    id: 'neo_soul_groove',
    name: 'Neo-Soul Velvet Chords',
    genre: 'Neo-Soul / R&B / Lo-Fi',
    description: 'Lush 9th and 11th extensions with subtle chromatic voice leading.',
    romanNumerals: ['i9', 'IV13', 'bVImaj9', 'V7#9'],
    chordsInC: [
      { root: 'C', chordId: 'min9', label: 'Cm9' },
      { root: 'F', chordId: 'dom9', label: 'F9' },
      { root: 'Ab', chordId: 'maj9', label: 'Abmaj9' },
      { root: 'G', chordId: 'hendrix_7sharp9', label: 'G7#9' },
    ],
  },
  {
    id: 'andalusian_cadence',
    name: 'Andalusian Flamenco (i - VII - VI - V)',
    genre: 'Flamenco / Latin / Classical',
    description: 'Dramatic descending tetrachord cadence ending on the dominant major.',
    romanNumerals: ['i', 'bVII', 'bVI', 'V'],
    chordsInC: [
      { root: 'A', chordId: 'minor', label: 'Am' },
      { root: 'G', chordId: 'major', label: 'G' },
      { root: 'F', chordId: 'major', label: 'F' },
      { root: 'E', chordId: 'dom7', label: 'E7' },
    ],
  },
  {
    id: 'royal_road',
    name: 'Royal Road (IV - V - iii - vi)',
    genre: 'J-Pop / Anime / City Pop',
    description: 'Iconic bittersweet Japanese progression famous in anime soundtracks and city pop.',
    romanNumerals: ['IVmaj7', 'V7', 'iiim7', 'vim7'],
    chordsInC: [
      { root: 'F', chordId: 'maj7', label: 'Fmaj7' },
      { root: 'G', chordId: 'dom7', label: 'G7' },
      { root: 'E', chordId: 'min7', label: 'Em7' },
      { root: 'A', chordId: 'min7', label: 'Am7' },
    ],
  },
];

// Helper to calculate notes of a scale
export function getScaleNotes(root: NoteName, scaleId: string): { note: NoteName; degree: string; interval: number }[] {
  const scale = SCALES.find((s) => s.id === scaleId) || SCALES[0];
  const rootIndex = noteToSemitone(root);
  const preferFlat = ['F', 'Bb', 'Eb', 'Ab', 'Db'].includes(root);

  return scale.intervals.map((semitoneOffset, idx) => {
    const note = semitoneToNote(rootIndex + semitoneOffset, preferFlat);
    return {
      note,
      degree: scale.degreeNames[idx] || `${idx + 1}`,
      interval: semitoneOffset,
    };
  });
}

// Helper to calculate notes of a chord
export function getChordNotes(root: NoteName, chordId: string): { note: NoteName; degree: string; interval: number }[] {
  const chord = CHORDS.find((c) => c.id === chordId) || CHORDS[0];
  const rootIndex = noteToSemitone(root);
  const preferFlat = ['F', 'Bb', 'Eb', 'Ab', 'Db'].includes(root);

  return chord.intervals.map((semitoneOffset, idx) => {
    const note = semitoneToNote(rootIndex + semitoneOffset, preferFlat);
    return {
      note,
      degree: chord.degreeLabels[idx] || `${idx + 1}`,
      interval: semitoneOffset,
    };
  });
}
