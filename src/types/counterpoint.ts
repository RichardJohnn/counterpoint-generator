export interface Note {
  pitch: string; // e.g., "C4"
  duration: "w" | "h" | "q" | "8" | "16" | "hd" | "qd"; //
  // measure: number; // which measure the note belongs to
  // position: number; // position within measure (0-based)
}

// Church modes for species counterpoint
export type Mode =
  | "ionian"     // C-C (major)
  | "dorian"     // D-D (minor with raised 6th)
  | "phrygian"   // E-E (minor with lowered 2nd)
  | "lydian"     // F-F (major with raised 4th)
  | "mixolydian" // G-G (major with lowered 7th)
  | "aeolian";   // A-A (natural minor)

// Interval patterns for each mode (in semitones from root)
export const MODE_INTERVALS: Record<Mode, number[]> = {
  ionian:     [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
  dorian:     [0, 2, 3, 5, 7, 9, 10], // W-H-W-W-W-H-W
  phrygian:   [0, 1, 3, 5, 7, 8, 10], // H-W-W-W-H-W-W
  lydian:     [0, 2, 4, 6, 7, 9, 11], // W-W-W-H-W-W-H
  mixolydian: [0, 2, 4, 5, 7, 9, 10], // W-W-H-W-W-H-W
  aeolian:    [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
};

export const MODE_NAMES: Record<Mode, string> = {
  ionian: "Ionian (Major)",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  aeolian: "Aeolian (Minor)",
};

// Common finalis (tonic) notes
export const FINALIS_OPTIONS = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type Finalis = typeof FINALIS_OPTIONS[number];

export interface Measure {
  notes: Note[];
}

export type TimeSignature = string | "C" | "C|";

export type NoteDurationMap = {
  [key: string]: number;
};

export type Species = 1 | 2 | 3 | 4 | 5;

export interface CounterpointState {
  cantusFirmus: Note[];
  counterpoint: Note[];
  selectedSpecies: Species;
  selectedMode: Mode;
  selectedFinalis: Finalis;
  isCounterpointAbove: boolean;
  history: { cantusFirmus: Note[]; counterpoint: Note[] }[];
}

export type CounterpointAction =
  | { type: "SET_CANTUS_FIRMUS"; notes: Note[] }
  | { type: "SET_COUNTERPOINT"; notes: Note[] }
  | { type: "SET_SPECIES"; species: Species }
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SET_FINALIS"; finalis: Finalis }
  | { type: "SET_COUNTERPOINT_POSITION"; position: boolean }
  | { type: "ADD_TO_HISTORY" }
  | { type: "UNDO" };

export interface CounterpointContextProps extends CounterpointState {
  setCantusFirmus: (notes: Note[]) => void;
  setCounterpoint: (notes: Note[]) => void;
  setSpecies: (species: Species) => void;
  setMode: (mode: Mode) => void;
  setFinalis: (finalis: Finalis) => void;
  setPosition: (isAbove: boolean) => void;
  addToHistory: () => void;
  undo: () => void;
}

// Rule configuration types
export type RuleId =
  | "noParallelFifths"
  | "noDirectFifths"
  | "preferContraryMotion"
  | "preferStepwiseMotion"
  | "consonantIntervalsOnly"
  // 2nd species specific
  | "downbeatConsonance"
  | "allowPassingTones"
  // 3rd species specific
  | "beatOneConsonance"
  | "beatThreeConsonance"
  | "allowCambiata"
  | "penultimateCadence"
  // 4th species specific
  | "upbeatConsonance"
  | "suspensionResolution"
  | "avoidRepetitions";

export interface RuleConfig {
  id: RuleId;
  name: string;
  description: string;
  weight: number; // 0-100
}

export interface NoteAnalysis {
  noteIndex: number;
  cfPitch: string;
  cpPitch: string;
  interval: string;
  ruleResults: {
    ruleId: RuleId;
    ruleName: string;
    passed: boolean;
    message: string;
  }[];
}

export interface GenerationAnalysis {
  noteAnalyses: NoteAnalysis[];
  summary: string;
}

// 1st Species rules
export const FIRST_SPECIES_RULES: RuleConfig[] = [
  {
    id: "noParallelFifths",
    name: "No Parallel 5ths/8ves",
    description: "Avoid consecutive perfect fifths or octaves",
    weight: 100,
  },
  {
    id: "noDirectFifths",
    name: "No Direct 5ths/8ves",
    description: "Avoid approaching perfect intervals by similar motion",
    weight: 80,
  },
  {
    id: "preferContraryMotion",
    name: "Prefer Contrary Motion",
    description: "Voices should move in opposite directions",
    weight: 60,
  },
  {
    id: "preferStepwiseMotion",
    name: "Prefer Stepwise Motion",
    description: "Counterpoint should move by step when possible",
    weight: 50,
  },
  {
    id: "consonantIntervalsOnly",
    name: "Consonant Intervals",
    description: "Use only consonant intervals (3rds, 5ths, 6ths, 8ves)",
    weight: 100,
  },
];

// 2nd Species rules (includes all 1st species rules plus new ones)
export const SECOND_SPECIES_RULES: RuleConfig[] = [
  // All 1st species rules still apply
  ...FIRST_SPECIES_RULES.map(rule => {
    // Adjust the parallel fifths rule description for 2nd species context
    if (rule.id === "noParallelFifths") {
      return {
        ...rule,
        name: "No Parallel 5ths/8ves on Downbeats",
        description: "Avoid parallel perfect intervals on consecutive downbeats",
      };
    }
    return { ...rule };
  }),
  // Additional 2nd species rules
  {
    id: "downbeatConsonance",
    name: "Downbeat Consonance",
    description: "Downbeats must be consonant with the cantus firmus",
    weight: 100,
  },
  {
    id: "allowPassingTones",
    name: "Allow Passing Tones",
    description: "Upbeats may be dissonant if moving by step (filling in the third)",
    weight: 100,
  },
];

// 3rd Species rules (4 quarter notes against each whole note)
export const THIRD_SPECIES_RULES: RuleConfig[] = [
  // Core 1st species rules still apply (adjusted for 3rd species context)
  {
    id: "noParallelFifths",
    name: "No Parallel 5ths/8ves on Beat 1",
    description: "Avoid parallel perfect intervals on consecutive downbeats",
    weight: 100,
  },
  {
    id: "noDirectFifths",
    name: "No Direct 5ths/8ves",
    description: "Avoid approaching perfect intervals by similar motion",
    weight: 80,
  },
  {
    id: "preferContraryMotion",
    name: "Prefer Contrary Motion",
    description: "Voices should move in opposite directions",
    weight: 60,
  },
  {
    id: "preferStepwiseMotion",
    name: "Prefer Stepwise Motion",
    description: "Counterpoint should move by step when possible",
    weight: 70,
  },
  // 3rd species specific rules
  {
    id: "beatOneConsonance",
    name: "Beat 1 Consonance",
    description: "First beat of each measure must be consonant",
    weight: 100,
  },
  {
    id: "beatThreeConsonance",
    name: "Beat 3 Consonance",
    description: "Third beat should be consonant (can be dissonant if others are consonant)",
    weight: 80,
  },
  {
    id: "allowCambiata",
    name: "Allow Cambiata",
    description: "Permit dissonant 2nd beat followed by leap to consonant, resolving opposite",
    weight: 100,
  },
  {
    id: "penultimateCadence",
    name: "Penultimate Cadence",
    description: "Second-to-last measure: M6→P8 (CF below) or m3→P1 (CF above)",
    weight: 90,
  },
];

// 4th Species rules (syncopated half notes with suspensions)
export const FOURTH_SPECIES_RULES: RuleConfig[] = [
  // Core rules
  {
    id: "noParallelFifths",
    name: "No Parallel 5ths/8ves",
    description: "Avoid parallel perfect intervals on consecutive upbeats",
    weight: 100,
  },
  {
    id: "noDirectFifths",
    name: "No Direct 5ths/8ves",
    description: "Avoid approaching perfect intervals by similar motion",
    weight: 80,
  },
  {
    id: "preferContraryMotion",
    name: "Prefer Contrary Motion",
    description: "Voices should move in opposite directions",
    weight: 60,
  },
  {
    id: "preferStepwiseMotion",
    name: "Prefer Stepwise Motion",
    description: "Counterpoint should move by step when possible",
    weight: 70,
  },
  // 4th species specific rules
  {
    id: "upbeatConsonance",
    name: "Upbeat Consonance",
    description: "Upbeats (beat 3) must always be consonant",
    weight: 100,
  },
  {
    id: "suspensionResolution",
    name: "Suspension Resolution",
    description: "Dissonances on downbeat must resolve down by step",
    weight: 100,
  },
  {
    id: "avoidRepetitions",
    name: "Avoid Repetitions",
    description: "Avoid repeating the same pitch pattern",
    weight: 50,
  },
];

// Helper to get rules by species
export function getRulesForSpecies(species: Species): RuleConfig[] {
  switch (species) {
    case 1:
      return FIRST_SPECIES_RULES;
    case 2:
      return SECOND_SPECIES_RULES;
    case 3:
      return THIRD_SPECIES_RULES;
    case 4:
      return FOURTH_SPECIES_RULES;
    default:
      return FIRST_SPECIES_RULES; // Fallback for unimplemented species
  }
}

// Keep DEFAULT_RULES for backward compatibility
export const DEFAULT_RULES = FIRST_SPECIES_RULES;
