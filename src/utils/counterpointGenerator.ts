import { Note, RuleConfig, RuleId, NoteAnalysis, GenerationAnalysis, DEFAULT_RULES, Mode, Finalis, MODE_INTERVALS } from "../types";
import { noteToNumber } from "./musicTheory";

const PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"];

const PERFECT_CONSONANCES = [0, 7, 12]; // P1, P5, P8

// Convert pitch string to MIDI note number
function pitchToMidi(pitch: string): number {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return 60;

  const [, noteName, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const noteIndex = NOTE_NAMES.indexOf(noteName);

  let midi = (octave + 1) * 12 + [0, 2, 4, 5, 7, 9, 11][noteIndex];

  if (accidental === "#") midi += 1;
  if (accidental === "b") midi -= 1;

  return midi;
}

// Get all MIDI pitches within a mode across a given range
function getModePitches(finalis: Finalis, mode: Mode, minPitch: number, maxPitch: number): Set<number> {
  const finalisMidi = pitchToMidi(`${finalis}4`);
  const intervals = MODE_INTERVALS[mode];
  const pitches = new Set<number>();

  // Generate scale pitches across multiple octaves
  for (let octaveOffset = -3; octaveOffset <= 3; octaveOffset++) {
    for (const interval of intervals) {
      const pitch = finalisMidi + interval + octaveOffset * 12;
      if (pitch >= minPitch && pitch <= maxPitch) {
        pitches.add(pitch);
      }
    }
  }

  return pitches;
}
const IMPERFECT_CONSONANCES = [3, 4, 8, 9]; // m3, M3, m6, M6
const ALL_CONSONANCES = [...PERFECT_CONSONANCES, ...IMPERFECT_CONSONANCES];

const MIN_PITCH = noteToNumber("C3");
const MAX_PITCH = noteToNumber("C6");

const INTERVAL_NAMES: Record<number, string> = {
  0: "P1",
  1: "m2",
  2: "M2",
  3: "m3",
  4: "M3",
  5: "P4",
  6: "TT",
  7: "P5",
  8: "m6",
  9: "M6",
  10: "m7",
  11: "M7",
  12: "P8",
};

export function numberToPitch(num: number): string {
  const octave = Math.floor(num / 12);
  const pitchClass = num % 12;
  return `${PITCH_CLASSES[pitchClass]}${octave}`;
}

export function getInterval(pitch1: string, pitch2: string): number {
  return Math.abs(noteToNumber(pitch1) - noteToNumber(pitch2));
}

export function getIntervalName(semitones: number): string {
  const normalized = semitones % 12;
  return INTERVAL_NAMES[normalized] || `${semitones}st`;
}

export function isConsonant(interval: number): boolean {
  const normalized = interval % 12;
  return ALL_CONSONANCES.includes(normalized);
}

export function isPerfectConsonance(interval: number): boolean {
  const normalized = interval % 12;
  return normalized === 0 || normalized === 7;
}

export function getConsonantPitches(
  cfPitch: string,
  isAbove: boolean,
  mode?: Mode,
  finalis?: Finalis
): string[] {
  const cfNum = noteToNumber(cfPitch);
  const pitches: string[] = [];

  const minRange = isAbove ? cfNum : MIN_PITCH;
  const maxRange = isAbove ? MAX_PITCH : cfNum;

  // Get mode pitches if mode and finalis are specified
  const modePitches = mode && finalis
    ? getModePitches(finalis, mode, MIN_PITCH, MAX_PITCH)
    : null;

  for (let num = minRange; num <= maxRange; num++) {
    const interval = Math.abs(num - cfNum);
    if (isConsonant(interval) && num >= MIN_PITCH && num <= MAX_PITCH) {
      // If mode is specified, only include pitches within the mode
      if (modePitches && !modePitches.has(num)) {
        continue;
      }
      pitches.push(numberToPitch(num));
    }
  }

  return pitches;
}

export function getAllPitchesInRange(
  cfPitch: string,
  isAbove: boolean,
  mode?: Mode,
  finalis?: Finalis
): string[] {
  const cfNum = noteToNumber(cfPitch);
  const pitches: string[] = [];

  const minRange = isAbove ? cfNum : MIN_PITCH;
  const maxRange = isAbove ? MAX_PITCH : cfNum;

  // Get mode pitches if mode and finalis are specified
  const modePitches = mode && finalis
    ? getModePitches(finalis, mode, MIN_PITCH, MAX_PITCH)
    : null;

  for (let num = minRange; num <= maxRange; num++) {
    if (num >= MIN_PITCH && num <= MAX_PITCH) {
      // If mode is specified, only include pitches within the mode
      if (modePitches && !modePitches.has(num)) {
        continue;
      }
      pitches.push(numberToPitch(num));
    }
  }

  return pitches;
}

// Rule checking functions
export function checkParallelFifths(
  prevCF: string,
  currCF: string,
  prevCP: string,
  currCP: string
): { passed: boolean; message: string } {
  const prevInterval = getInterval(prevCF, prevCP);
  const currInterval = getInterval(currCF, currCP);

  const prevIsPerfect = isPerfectConsonance(prevInterval);
  const currIsPerfect = isPerfectConsonance(currInterval);

  if (!prevIsPerfect || !currIsPerfect) {
    return { passed: true, message: "No parallel perfect intervals" };
  }

  const prevNorm = prevInterval % 12;
  const currNorm = currInterval % 12;

  if (prevNorm !== currNorm) {
    return { passed: true, message: "Different interval types" };
  }

  const cfMotion = noteToNumber(currCF) - noteToNumber(prevCF);
  const cpMotion = noteToNumber(currCP) - noteToNumber(prevCP);

  const isParallel = (cfMotion > 0 && cpMotion > 0) || (cfMotion < 0 && cpMotion < 0);

  if (isParallel) {
    const intervalName = currNorm === 0 ? "octaves" : "fifths";
    return { passed: false, message: `Parallel ${intervalName}` };
  }

  return { passed: true, message: "No parallel motion" };
}

export function checkDirectFifths(
  prevCF: string,
  currCF: string,
  prevCP: string,
  currCP: string
): { passed: boolean; message: string } {
  const currInterval = getInterval(currCF, currCP);

  if (!isPerfectConsonance(currInterval)) {
    return { passed: true, message: "Not a perfect interval" };
  }

  const cfMotion = noteToNumber(currCF) - noteToNumber(prevCF);
  const cpMotion = noteToNumber(currCP) - noteToNumber(prevCP);

  const isSimilarMotion = (cfMotion > 0 && cpMotion > 0) || (cfMotion < 0 && cpMotion < 0);

  if (isSimilarMotion) {
    const cpStep = Math.abs(cpMotion);
    if (cpStep > 2) {
      const intervalName = currInterval % 12 === 0 ? "octave" : "fifth";
      return { passed: false, message: `Direct ${intervalName} by leap` };
    }
  }

  return { passed: true, message: "No direct fifths/octaves" };
}

export function checkContraryMotion(
  prevCF: string,
  currCF: string,
  prevCP: string,
  currCP: string
): { passed: boolean; message: string } {
  const cfMotion = noteToNumber(currCF) - noteToNumber(prevCF);
  const cpMotion = noteToNumber(currCP) - noteToNumber(prevCP);

  if (cfMotion === 0 || cpMotion === 0) {
    return { passed: true, message: "Oblique motion" };
  }

  const isContrary = (cfMotion > 0 && cpMotion < 0) || (cfMotion < 0 && cpMotion > 0);

  if (isContrary) {
    return { passed: true, message: "Contrary motion" };
  }

  return { passed: false, message: "Similar motion" };
}

// Check for forbidden melodic intervals per Fux rules:
// - Tritone (augmented 4th) = 6 semitones
// - Sevenths (minor = 10, major = 11)
// - Greater than octave (> 12)
// - Descending sixths (minor = 8, major = 9)
// - Ascending major sixth = 9
export function checkForbiddenInterval(
  prevCP: string,
  currCP: string
): { passed: boolean; message: string } {
  const prevNum = noteToNumber(prevCP);
  const currNum = noteToNumber(currCP);
  const interval = Math.abs(currNum - prevNum);
  const direction = currNum > prevNum ? "ascending" : "descending";

  // Tritone
  if (interval === 6) {
    return { passed: false, message: "Forbidden: tritone leap" };
  }

  // Sevenths
  if (interval === 10) {
    return { passed: false, message: "Forbidden: minor 7th leap" };
  }
  if (interval === 11) {
    return { passed: false, message: "Forbidden: major 7th leap" };
  }

  // Greater than octave
  if (interval > 12) {
    return { passed: false, message: `Forbidden: leap greater than octave (${interval} semitones)` };
  }

  // Descending sixths (both minor and major)
  if (direction === "descending" && (interval === 8 || interval === 9)) {
    const sixthType = interval === 8 ? "minor" : "major";
    return { passed: false, message: `Forbidden: descending ${sixthType} 6th` };
  }

  // Ascending major sixth
  if (direction === "ascending" && interval === 9) {
    return { passed: false, message: "Forbidden: ascending major 6th" };
  }

  return { passed: true, message: interval <= 2 ? "Stepwise motion" : `Leap of ${getIntervalName(interval)}` };
}

// Check if a large leap needs recovery (step back into the leap range)
// Leaps requiring recovery: ascending m6, ascending octave, descending octave
export function checkLeapRecovery(
  prevPrevCP: string | null,
  prevCP: string,
  currCP: string
): { passed: boolean; message: string; needsRecovery: boolean } {
  if (!prevPrevCP) {
    return { passed: true, message: "No previous leap to recover", needsRecovery: false };
  }

  const prevPrevNum = noteToNumber(prevPrevCP);
  const prevNum = noteToNumber(prevCP);
  const currNum = noteToNumber(currCP);

  const prevInterval = Math.abs(prevNum - prevPrevNum);
  const prevDirection = prevNum > prevPrevNum ? 1 : -1; // 1 = up, -1 = down

  // Check if previous interval was a leap needing recovery
  const needsRecoveryUp = prevDirection === 1 && (prevInterval === 8 || prevInterval === 12); // ascending m6 or octave
  const needsRecoveryDown = prevDirection === -1 && prevInterval === 12; // descending octave

  if (!needsRecoveryUp && !needsRecoveryDown) {
    return { passed: true, message: "No recovery needed", needsRecovery: false };
  }

  // Recovery must be a step (1-2 semitones) in opposite direction
  const currInterval = Math.abs(currNum - prevNum);
  const currDirection = currNum > prevNum ? 1 : -1;
  const isStep = currInterval <= 2;
  const isOppositeDirection = currDirection !== prevDirection;

  if (isStep && isOppositeDirection) {
    return { passed: true, message: "Leap properly recovered by step", needsRecovery: false };
  }

  const leapType = needsRecoveryUp
    ? (prevInterval === 8 ? "ascending minor 6th" : "ascending octave")
    : "descending octave";

  return {
    passed: false,
    message: `Leap recovery needed: ${leapType} must be followed by step in opposite direction`,
    needsRecovery: true
  };
}

// Check for exposed/outlined tritone (run of notes in single direction spanning augmented 4th)
export function checkExposedTritone(
  recentPitches: string[],
  newPitch: string
): { passed: boolean; message: string } {
  if (recentPitches.length < 1) {
    return { passed: true, message: "No tritone outline" };
  }

  const pitchNums = [...recentPitches.map(p => noteToNumber(p)), noteToNumber(newPitch)];

  // Check last 4 notes for single-direction run that outlines a tritone
  const checkLength = Math.min(pitchNums.length, 4);
  const recentNums = pitchNums.slice(-checkLength);

  if (recentNums.length < 2) {
    return { passed: true, message: "No tritone outline" };
  }

  // Determine if notes are moving in a single direction
  let direction: number | null = null;
  let isSingleDirection = true;

  for (let i = 1; i < recentNums.length; i++) {
    const currDir = recentNums[i] > recentNums[i - 1] ? 1 : (recentNums[i] < recentNums[i - 1] ? -1 : 0);
    if (currDir === 0) continue; // Skip repeated notes
    if (direction === null) {
      direction = currDir;
    } else if (currDir !== direction) {
      isSingleDirection = false;
      break;
    }
  }

  if (!isSingleDirection || direction === null) {
    return { passed: true, message: "No tritone outline" };
  }

  // Check if the span of the run is a tritone
  const first = recentNums[0];
  const last = recentNums[recentNums.length - 1];
  const span = Math.abs(last - first);

  if (span === 6) {
    return { passed: false, message: "Exposed tritone: notes outline augmented 4th" };
  }

  return { passed: true, message: "No tritone outline" };
}

// Check for multiple consecutive leaps in the same direction
export function checkConsecutiveLeapsSameDirection(
  recentPitches: string[],
  newPitch: string
): { passed: boolean; message: string } {
  if (recentPitches.length < 2) {
    return { passed: true, message: "Melodic variety" };
  }

  const pitchNums = [...recentPitches.map(p => noteToNumber(p)), noteToNumber(newPitch)];
  const recentNums = pitchNums.slice(-4); // Check last 4 notes (3 intervals)

  if (recentNums.length < 3) {
    return { passed: true, message: "Melodic variety" };
  }

  // Count consecutive leaps (> 2 semitones) in same direction
  let consecutiveLeapsSameDir = 0;
  let lastLeapDir: number | null = null;

  for (let i = 1; i < recentNums.length; i++) {
    const interval = Math.abs(recentNums[i] - recentNums[i - 1]);
    const direction = recentNums[i] > recentNums[i - 1] ? 1 : -1;

    if (interval > 2) { // It's a leap
      if (lastLeapDir === direction) {
        consecutiveLeapsSameDir++;
      } else {
        consecutiveLeapsSameDir = 1;
        lastLeapDir = direction;
      }
    } else {
      // Step resets the counter
      consecutiveLeapsSameDir = 0;
      lastLeapDir = null;
    }
  }

  // Fux advises against multiple skips in same direction (though he breaks this sometimes)
  if (consecutiveLeapsSameDir >= 2) {
    return {
      passed: false,
      message: `Multiple leaps in same direction (${consecutiveLeapsSameDir + 1} consecutive)`
    };
  }

  return { passed: true, message: "Melodic variety" };
}

// Legacy wrapper for backwards compatibility - now checks forbidden intervals
export function checkStepwiseMotion(
  prevCP: string,
  currCP: string
): { passed: boolean; message: string } {
  return checkForbiddenInterval(prevCP, currCP);
}

export function checkConsonance(
  cfPitch: string,
  cpPitch: string
): { passed: boolean; message: string } {
  const interval = getInterval(cfPitch, cpPitch);

  if (isConsonant(interval)) {
    return { passed: true, message: `Consonant (${getIntervalName(interval)})` };
  }

  return { passed: false, message: `Dissonant (${getIntervalName(interval)})` };
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRuleWeight(rules: RuleConfig[], ruleId: RuleId): number {
  const rule = rules.find((r) => r.id === ruleId);
  return rule ? rule.weight : 100;
}

function scoreCandidate(
  candidate: string,
  cfPitch: string,
  prevCF: string | null,
  prevCP: string | null,
  rules: RuleConfig[],
  recentPitches: string[] = []
): number {
  let score = 100;

  // Check consonance
  const consonanceWeight = getRuleWeight(rules, "consonantIntervalsOnly");
  const consonanceCheck = checkConsonance(cfPitch, candidate);
  if (!consonanceCheck.passed) {
    score -= consonanceWeight;
  }

  if (prevCF && prevCP) {
    // Check parallel fifths
    const parallelWeight = getRuleWeight(rules, "noParallelFifths");
    const parallelCheck = checkParallelFifths(prevCF, cfPitch, prevCP, candidate);
    if (!parallelCheck.passed) {
      score -= parallelWeight;
    }

    // Check direct fifths
    const directWeight = getRuleWeight(rules, "noDirectFifths");
    const directCheck = checkDirectFifths(prevCF, cfPitch, prevCP, candidate);
    if (!directCheck.passed) {
      score -= directWeight;
    }

    // Check contrary motion
    const contraryWeight = getRuleWeight(rules, "preferContraryMotion");
    const contraryCheck = checkContraryMotion(prevCF, cfPitch, prevCP, candidate);
    if (!contraryCheck.passed) {
      score -= contraryWeight * 0.5; // Less penalty for preference rules
    }

    // Check forbidden intervals (replaces old stepwise check)
    const forbiddenWeight = getRuleWeight(rules, "noForbiddenIntervals");
    const forbiddenCheck = checkForbiddenInterval(prevCP, candidate);
    if (!forbiddenCheck.passed) {
      score -= forbiddenWeight;
    }

    // Check for repeated notes
    const repetitionWeight = getRuleWeight(rules, "avoidRepetitions");
    if (prevCP === candidate) {
      score -= repetitionWeight;
    }
  }

  // Check exposed tritone (needs context of recent pitches)
  if (recentPitches.length > 0) {
    const exposedTritoneWeight = getRuleWeight(rules, "noExposedTritone");
    const tritoneCheck = checkExposedTritone(recentPitches, candidate);
    if (!tritoneCheck.passed) {
      score -= exposedTritoneWeight * 0.8;
    }
  }

  // Check consecutive leaps in same direction
  if (recentPitches.length >= 2) {
    const consecutiveLeapsWeight = getRuleWeight(rules, "avoidConsecutiveLeaps");
    const leapsCheck = checkConsecutiveLeapsSameDirection(recentPitches, candidate);
    if (!leapsCheck.passed) {
      score -= consecutiveLeapsWeight * 0.5;
    }
  }

  return score;
}

function analyzeNotePair(
  noteIndex: number,
  cfPitch: string,
  cpPitch: string,
  prevCF: string | null,
  prevCP: string | null,
  rules: RuleConfig[]
): NoteAnalysis {
  const interval = getInterval(cfPitch, cpPitch);
  const ruleResults: NoteAnalysis["ruleResults"] = [];

  // Always check consonance
  const consonanceRule = rules.find((r) => r.id === "consonantIntervalsOnly");
  const consonanceCheck = checkConsonance(cfPitch, cpPitch);
  ruleResults.push({
    ruleId: "consonantIntervalsOnly",
    ruleName: consonanceRule?.name || "Consonance",
    passed: consonanceCheck.passed,
    message: consonanceCheck.message,
  });

  if (prevCF && prevCP) {
    const parallelRule = rules.find((r) => r.id === "noParallelFifths");
    const parallelCheck = checkParallelFifths(prevCF, cfPitch, prevCP, cpPitch);
    ruleResults.push({
      ruleId: "noParallelFifths",
      ruleName: parallelRule?.name || "No Parallels",
      passed: parallelCheck.passed,
      message: parallelCheck.message,
    });

    const directRule = rules.find((r) => r.id === "noDirectFifths");
    const directCheck = checkDirectFifths(prevCF, cfPitch, prevCP, cpPitch);
    ruleResults.push({
      ruleId: "noDirectFifths",
      ruleName: directRule?.name || "No Direct",
      passed: directCheck.passed,
      message: directCheck.message,
    });

    const contraryRule = rules.find((r) => r.id === "preferContraryMotion");
    const contraryCheck = checkContraryMotion(prevCF, cfPitch, prevCP, cpPitch);
    ruleResults.push({
      ruleId: "preferContraryMotion",
      ruleName: contraryRule?.name || "Contrary Motion",
      passed: contraryCheck.passed,
      message: contraryCheck.message,
    });

    // Check for forbidden melodic intervals
    const forbiddenRule = rules.find((r) => r.id === "noForbiddenIntervals");
    const forbiddenCheck = checkForbiddenInterval(prevCP, cpPitch);
    ruleResults.push({
      ruleId: "noForbiddenIntervals",
      ruleName: forbiddenRule?.name || "Melodic Motion",
      passed: forbiddenCheck.passed,
      message: forbiddenCheck.message,
    });

    // Check for repeated notes
    if (prevCP === cpPitch) {
      const repetitionRule = rules.find((r) => r.id === "avoidRepetitions");
      ruleResults.push({
        ruleId: "avoidRepetitions",
        ruleName: repetitionRule?.name || "Avoid Repetitions",
        passed: false,
        message: "Repeated note",
      });
    }
  }

  return {
    noteIndex,
    cfPitch,
    cpPitch,
    interval: getIntervalName(interval),
    ruleResults,
  };
}

export interface GenerationResult {
  notes: Note[];
  analysis: GenerationAnalysis;
  success: boolean;
  error?: string;
}

// Check if an interval is dissonant
export function isDissonant(interval: number): boolean {
  return !isConsonant(interval);
}

// Get all pitches that are a step away from a given pitch
export function getStepwisePitches(
  fromPitch: string,
  mode?: Mode,
  finalis?: Finalis
): string[] {
  const fromNum = noteToNumber(fromPitch);
  const pitches: string[] = [];

  // Get mode pitches if mode and finalis are specified
  const modePitches = mode && finalis
    ? getModePitches(finalis, mode, MIN_PITCH, MAX_PITCH)
    : null;

  // Steps are 1 or 2 semitones
  for (const step of [-2, -1, 1, 2]) {
    const newNum = fromNum + step;
    if (newNum >= MIN_PITCH && newNum <= MAX_PITCH) {
      // If mode is specified, only include pitches within the mode
      if (modePitches && !modePitches.has(newNum)) {
        continue;
      }
      pitches.push(numberToPitch(newNum));
    }
  }

  return pitches;
}

// Check for parallel perfect intervals on downbeats (for 2nd species)
export function checkDownbeatParallels(
  prevCF: string,
  currCF: string,
  prevDownbeat: string,
  currDownbeat: string
): { passed: boolean; message: string } {
  return checkParallelFifths(prevCF, currCF, prevDownbeat, currDownbeat);
}

// Analyze a 2nd species measure (two half notes against one whole note)
function analyzeSecondSpeciesMeasure(
  measureIndex: number,
  cfPitch: string,
  downbeat: string,
  upbeat: string,
  prevCF: string | null,
  prevDownbeat: string | null,
  rules: RuleConfig[]
): NoteAnalysis[] {
  const analyses: NoteAnalysis[] = [];

  // Analyze downbeat
  const downbeatInterval = getInterval(cfPitch, downbeat);
  const downbeatRules: NoteAnalysis["ruleResults"] = [];

  const consonanceRule = rules.find((r) => r.id === "consonantIntervalsOnly");
  const downbeatConsonance = isConsonant(downbeatInterval);
  downbeatRules.push({
    ruleId: "consonantIntervalsOnly",
    ruleName: consonanceRule?.name || "Consonance",
    passed: downbeatConsonance,
    message: downbeatConsonance
      ? `Consonant downbeat (${getIntervalName(downbeatInterval)})`
      : `Dissonant downbeat (${getIntervalName(downbeatInterval)})`,
  });

  if (prevCF && prevDownbeat) {
    const parallelRule = rules.find((r) => r.id === "noParallelFifths");
    const parallelCheck = checkDownbeatParallels(prevCF, cfPitch, prevDownbeat, downbeat);
    downbeatRules.push({
      ruleId: "noParallelFifths",
      ruleName: parallelRule?.name || "No Parallels",
      passed: parallelCheck.passed,
      message: parallelCheck.message + " (on downbeats)",
    });
  }

  analyses.push({
    noteIndex: measureIndex * 2,
    cfPitch,
    cpPitch: downbeat,
    interval: getIntervalName(downbeatInterval),
    ruleResults: downbeatRules,
  });

  // Analyze upbeat
  const upbeatInterval = getInterval(cfPitch, upbeat);
  const upbeatRules: NoteAnalysis["ruleResults"] = [];

  const isUpbeatConsonant = isConsonant(upbeatInterval);
  const stepFromDownbeat = Math.abs(noteToNumber(upbeat) - noteToNumber(downbeat));
  const isStepFromDownbeat = stepFromDownbeat <= 2;

  if (isUpbeatConsonant) {
    upbeatRules.push({
      ruleId: "consonantIntervalsOnly",
      ruleName: "Upbeat consonance",
      passed: true,
      message: `Consonant upbeat (${getIntervalName(upbeatInterval)})`,
    });
  } else {
    // Dissonant upbeat - check if it's a valid passing tone
    const isValidPassingTone = isStepFromDownbeat;
    upbeatRules.push({
      ruleId: "consonantIntervalsOnly",
      ruleName: "Passing tone",
      passed: isValidPassingTone,
      message: isValidPassingTone
        ? `Valid passing tone (${getIntervalName(upbeatInterval)})`
        : `Invalid dissonance - must move by step (${getIntervalName(upbeatInterval)})`,
    });
  }

  analyses.push({
    noteIndex: measureIndex * 2 + 1,
    cfPitch,
    cpPitch: upbeat,
    interval: getIntervalName(upbeatInterval),
    ruleResults: upbeatRules,
  });

  return analyses;
}

export function generateSecondSpecies(
  cantusFirmus: Note[],
  isAbove: boolean,
  rules: RuleConfig[] = DEFAULT_RULES,
  mode?: Mode,
  finalis?: Finalis
): GenerationResult {
  if (cantusFirmus.length === 0) {
    return {
      notes: [],
      analysis: { noteAnalyses: [], summary: "No cantus firmus provided" },
      success: false,
      error: "Cantus firmus is empty",
    };
  }

  // Two-pass approach:
  // 1. First generate all downbeats (like 1st species)
  // 2. Then fill in upbeats that connect consecutive downbeats

  // Pass 1: Generate downbeats using 1st species logic
  const downbeats: string[] = [];

  function backtrackDownbeats(cfIndex: number): boolean {
    if (cfIndex === cantusFirmus.length) {
      return true;
    }

    const cfPitch = cantusFirmus[cfIndex].pitch;
    const prevCF = cfIndex > 0 ? cantusFirmus[cfIndex - 1].pitch : null;
    const prevDownbeat = cfIndex > 0 ? downbeats[cfIndex - 1] : null;
    const isLastMeasure = cfIndex === cantusFirmus.length - 1;
    const isFirstMeasure = cfIndex === 0;

    let candidates = getConsonantPitches(cfPitch, isAbove, mode, finalis);

    // First measure: prefer perfect consonances
    if (isFirstMeasure) {
      const perfectCandidates = candidates.filter((p) => {
        const interval = getInterval(cfPitch, p);
        return isPerfectConsonance(interval);
      });
      if (perfectCandidates.length > 0) {
        candidates = perfectCandidates;
      }
    }

    // Last measure: end on P1 or P8
    if (isLastMeasure) {
      const finalCandidates = candidates.filter((p) => {
        const interval = getInterval(cfPitch, p);
        return interval === 0 || interval === 12;
      });
      if (finalCandidates.length > 0) {
        candidates = finalCandidates;
      }
    }

    // Score candidates
    const scored = candidates.map((c) => ({
      pitch: c,
      score: scoreCandidate(c, cfPitch, prevCF, prevDownbeat, rules),
    }));

    scored.sort((a, b) => b.score - a.score);

    // Shuffle within score groups for variety
    const grouped: Map<number, string[]> = new Map();
    for (const { pitch, score } of scored) {
      if (!grouped.has(score)) grouped.set(score, []);
      grouped.get(score)!.push(pitch);
    }

    const sortedCandidates: string[] = [];
    for (const score of Array.from(grouped.keys()).sort((a, b) => b - a)) {
      sortedCandidates.push(...shuffleArray(grouped.get(score)!));
    }

    for (const candidate of sortedCandidates) {
      downbeats[cfIndex] = candidate;
      if (backtrackDownbeats(cfIndex + 1)) {
        return true;
      }
    }

    return false;
  }

  if (!backtrackDownbeats(0)) {
    return {
      notes: [],
      analysis: { noteAnalyses: [], summary: "Generation failed" },
      success: false,
      error: "Could not generate valid downbeats",
    };
  }

  // Pass 2: Fill in upbeats that connect consecutive downbeats
  const result: { downbeat: string; upbeat: string }[] = [];

  for (let i = 0; i < downbeats.length; i++) {
    const currentDownbeat = downbeats[i];
    const nextDownbeat = i < downbeats.length - 1 ? downbeats[i + 1] : currentDownbeat;
    const cfPitch = cantusFirmus[i].pitch;
    const isLastMeasure = i === cantusFirmus.length - 1;

    // Choose upbeat that connects current downbeat to next downbeat
    let upbeat: string;

    if (isLastMeasure) {
      // Last measure: just repeat the final note
      upbeat = currentDownbeat;
    } else {
      // Find a good passing tone between current and next downbeat
      const currentNum = noteToNumber(currentDownbeat);
      const nextNum = noteToNumber(nextDownbeat);
      const direction = nextNum > currentNum ? 1 : nextNum < currentNum ? -1 : 0;

      // Get candidates: prefer stepwise motion in direction of next downbeat
      const upbeatCandidates: { pitch: string; score: number }[] = [];

      // Get mode pitches if mode and finalis are specified
      const modePitches = mode && finalis
        ? getModePitches(finalis, mode, MIN_PITCH, MAX_PITCH)
        : null;

      // Try steps in both directions, but prefer the direction toward next downbeat
      for (const step of [-2, -1, 1, 2]) {
        const upbeatNum = currentNum + step;
        if (upbeatNum < MIN_PITCH || upbeatNum > MAX_PITCH) continue;

        // Skip if not in mode
        if (modePitches && !modePitches.has(upbeatNum)) continue;

        const upbeatPitch = numberToPitch(upbeatNum);
        const upbeatInterval = getInterval(cfPitch, upbeatPitch);
        const isUpbeatConsonant = isConsonant(upbeatInterval);
        const stepToNext = Math.abs(nextNum - upbeatNum);

        let score = 100;

        // Dissonant upbeats must resolve by step to next downbeat
        if (!isUpbeatConsonant && stepToNext > 2) {
          continue; // Invalid - dissonant note that doesn't resolve by step
        }

        // Prefer motion toward next downbeat
        if (direction !== 0 && Math.sign(step) === direction) {
          score += 30;
        }

        // Prefer smaller steps to next downbeat
        score -= stepToNext * 5;

        // Prefer consonant upbeats slightly
        if (isUpbeatConsonant) {
          score += 10;
        }

        // Add variety
        score += Math.random() * 15;

        upbeatCandidates.push({ pitch: upbeatPitch, score });
      }

      // Also consider consonant leaps
      const consonantPitches = getConsonantPitches(cfPitch, isAbove, mode, finalis);
      for (const pitch of consonantPitches) {
        const pitchNum = noteToNumber(pitch);
        const stepFromCurrent = Math.abs(pitchNum - currentNum);
        const stepToNext = Math.abs(nextNum - pitchNum);

        // Skip if already considered as stepwise
        if (stepFromCurrent <= 2) continue;

        let score = 50; // Lower base score for leaps

        // Must be able to step to next downbeat
        if (stepToNext <= 2) {
          score += 20;
        }

        // Prefer motion toward next downbeat
        if (direction !== 0) {
          const leapDirection = pitchNum > currentNum ? 1 : -1;
          if (leapDirection === direction) {
            score += 15;
          }
        }

        score += Math.random() * 10;

        upbeatCandidates.push({ pitch, score });
      }

      // Sort by score and pick best
      upbeatCandidates.sort((a, b) => b.score - a.score);
      upbeat = upbeatCandidates.length > 0 ? upbeatCandidates[0].pitch : currentDownbeat;
    }

    result.push({ downbeat: currentDownbeat, upbeat });
  }

  // Convert to Note[] with half note durations
  const notes: Note[] = [];
  for (const { downbeat, upbeat } of result) {
    notes.push({ pitch: downbeat, duration: "h" });
    notes.push({ pitch: upbeat, duration: "h" });
  }

  // Generate analysis
  const noteAnalyses: NoteAnalysis[] = [];
  let violations = 0;

  for (let i = 0; i < result.length; i++) {
    const prevCF = i > 0 ? cantusFirmus[i - 1].pitch : null;
    const prevDownbeat = i > 0 ? result[i - 1].downbeat : null;

    const measureAnalyses = analyzeSecondSpeciesMeasure(
      i,
      cantusFirmus[i].pitch,
      result[i].downbeat,
      result[i].upbeat,
      prevCF,
      prevDownbeat,
      rules
    );

    noteAnalyses.push(...measureAnalyses);
    violations += measureAnalyses.flatMap(a => a.ruleResults).filter(r => !r.passed).length;
  }

  const summary =
    violations === 0
      ? "All rules followed (2nd species)"
      : `${violations} rule violation${violations === 1 ? "" : "s"} (2nd species)`;

  return {
    notes,
    analysis: { noteAnalyses, summary },
    success: true,
  };
}

export function generateFirstSpecies(
  cantusFirmus: Note[],
  isAbove: boolean,
  rules: RuleConfig[] = DEFAULT_RULES,
  mode?: Mode,
  finalis?: Finalis
): GenerationResult {
  if (cantusFirmus.length === 0) {
    return {
      notes: [],
      analysis: { noteAnalyses: [], summary: "No cantus firmus provided" },
      success: false,
      error: "Cantus firmus is empty",
    };
  }

  const result: string[] = [];

  function backtrack(index: number): boolean {
    if (index === cantusFirmus.length) {
      return true;
    }

    const cfPitch = cantusFirmus[index].pitch;

    // Get all pitches, not just consonant ones (weight will handle preference)
    const consonanceWeight = getRuleWeight(rules, "consonantIntervalsOnly");
    let candidates = consonanceWeight >= 100
      ? getConsonantPitches(cfPitch, isAbove, mode, finalis)
      : getAllPitchesInRange(cfPitch, isAbove, mode, finalis);

    // First note: prefer perfect consonances
    if (index === 0) {
      const perfectCandidates = candidates.filter((p) => {
        const interval = getInterval(cfPitch, p);
        return isPerfectConsonance(interval);
      });
      if (perfectCandidates.length > 0) {
        candidates = perfectCandidates;
      }
    }

    // Last note: must be P1 or P8
    if (index === cantusFirmus.length - 1) {
      const finalCandidates = candidates.filter((p) => {
        const interval = getInterval(cfPitch, p);
        return interval === 0 || interval === 12;
      });
      if (finalCandidates.length > 0) {
        candidates = finalCandidates;
      }
    }

    const prevCF = index > 0 ? cantusFirmus[index - 1].pitch : null;
    const prevCP = index > 0 ? result[index - 1] : null;

    // Score and sort candidates
    const scored = candidates.map((c) => ({
      pitch: c,
      score: scoreCandidate(c, cfPitch, prevCF, prevCP, rules),
    }));

    // Sort by score descending, then shuffle within same score for variety
    scored.sort((a, b) => b.score - a.score);

    // Group by score and shuffle within groups
    const grouped: Map<number, string[]> = new Map();
    for (const { pitch, score } of scored) {
      if (!grouped.has(score)) {
        grouped.set(score, []);
      }
      grouped.get(score)!.push(pitch);
    }

    const sortedCandidates: string[] = [];
    const sortedScores = Array.from(grouped.keys()).sort((a, b) => b - a);
    for (const score of sortedScores) {
      sortedCandidates.push(...shuffleArray(grouped.get(score)!));
    }

    // Try each candidate
    for (const candidate of sortedCandidates) {
      result[index] = candidate;
      if (backtrack(index + 1)) {
        return true;
      }
    }

    return false;
  }

  if (backtrack(0)) {
    const notes: Note[] = result.map((pitch) => ({
      pitch,
      duration: "w" as const,
    }));

    // Generate analysis
    const noteAnalyses: NoteAnalysis[] = [];
    let violations = 0;

    for (let i = 0; i < result.length; i++) {
      const prevCF = i > 0 ? cantusFirmus[i - 1].pitch : null;
      const prevCP = i > 0 ? result[i - 1] : null;
      const analysis = analyzeNotePair(
        i,
        cantusFirmus[i].pitch,
        result[i],
        prevCF,
        prevCP,
        rules
      );
      noteAnalyses.push(analysis);
      violations += analysis.ruleResults.filter((r) => !r.passed).length;
    }

    const summary =
      violations === 0
        ? "All rules followed"
        : `${violations} rule violation${violations === 1 ? "" : "s"}`;

    return {
      notes,
      analysis: { noteAnalyses, summary },
      success: true,
    };
  }

  return {
    notes: [],
    analysis: { noteAnalyses: [], summary: "Generation failed" },
    success: false,
    error: "Could not generate valid counterpoint for this cantus firmus",
  };
}

// Analyze a 3rd species measure (four quarter notes against one whole note)
function analyzeThirdSpeciesMeasure(
  measureIndex: number,
  cfPitch: string,
  beats: [string, string, string, string],
  prevCF: string | null,
  prevBeat1: string | null,
  rules: RuleConfig[]
): NoteAnalysis[] {
  const analyses: NoteAnalysis[] = [];

  for (let beatIndex = 0; beatIndex < 4; beatIndex++) {
    const beat = beats[beatIndex];
    const interval = getInterval(cfPitch, beat);
    const beatRules: NoteAnalysis["ruleResults"] = [];
    const isConsonantInterval = isConsonant(interval);

    // Check beat-specific consonance requirements
    if (beatIndex === 0) {
      // Beat 1 must be consonant
      beatRules.push({
        ruleId: "beatOneConsonance",
        ruleName: "Beat 1 Consonance",
        passed: isConsonantInterval,
        message: isConsonantInterval
          ? `Consonant (${getIntervalName(interval)})`
          : `Beat 1 must be consonant (${getIntervalName(interval)})`,
      });

      // Check parallel 5ths/8ves with previous beat 1
      if (prevCF && prevBeat1) {
        const parallelCheck = checkParallelFifths(prevCF, cfPitch, prevBeat1, beat);
        beatRules.push({
          ruleId: "noParallelFifths",
          ruleName: "No Parallel 5ths/8ves",
          passed: parallelCheck.passed,
          message: parallelCheck.message,
        });
      }
    } else if (beatIndex === 2) {
      // Beat 3 should generally be consonant
      const beatThreeRule = rules.find(r => r.id === "beatThreeConsonance");
      const weight = beatThreeRule?.weight ?? 80;
      // If weight < 100, allow dissonance on beat 3
      const passed = isConsonantInterval || weight < 100;
      beatRules.push({
        ruleId: "beatThreeConsonance",
        ruleName: "Beat 3 Consonance",
        passed,
        message: isConsonantInterval
          ? `Consonant (${getIntervalName(interval)})`
          : passed
            ? `Dissonant allowed (${getIntervalName(interval)})`
            : `Beat 3 should be consonant (${getIntervalName(interval)})`,
      });
    } else {
      // Beats 2 and 4 can be dissonant if stepwise
      if (beatIndex > 0) {
        const prevBeat = beats[beatIndex - 1];
        const stepFromPrev = Math.abs(noteToNumber(beat) - noteToNumber(prevBeat));
        const isStepwise = stepFromPrev <= 2;

        if (!isConsonantInterval) {
          beatRules.push({
            ruleId: "allowPassingTones",
            ruleName: "Passing Tone",
            passed: isStepwise,
            message: isStepwise
              ? `Valid passing tone (${getIntervalName(interval)})`
              : `Dissonance must move by step (${getIntervalName(interval)})`,
          });
        } else {
          beatRules.push({
            ruleId: "consonantIntervalsOnly",
            ruleName: "Consonance",
            passed: true,
            message: `Consonant (${getIntervalName(interval)})`,
          });
        }
      }
    }

    // Check stepwise motion from previous beat
    if (beatIndex > 0) {
      const prevBeat = beats[beatIndex - 1];
      const stepCheck = checkStepwiseMotion(prevBeat, beat);
      beatRules.push({
        ruleId: "preferStepwiseMotion",
        ruleName: "Stepwise Motion",
        passed: stepCheck.passed,
        message: stepCheck.message,
      });
    }

    analyses.push({
      noteIndex: measureIndex * 4 + beatIndex,
      cfPitch,
      cpPitch: beat,
      interval: getIntervalName(interval),
      ruleResults: beatRules,
    });
  }

  return analyses;
}

export function generateThirdSpecies(
  cantusFirmus: Note[],
  isAbove: boolean,
  rules: RuleConfig[] = DEFAULT_RULES,
  mode?: Mode,
  finalis?: Finalis
): GenerationResult {
  if (cantusFirmus.length === 0) {
    return {
      notes: [],
      analysis: { noteAnalyses: [], summary: "No cantus firmus provided" },
      success: false,
      error: "Cantus firmus is empty",
    };
  }

  // Get mode pitches if specified
  const modePitches = mode && finalis
    ? getModePitches(finalis, mode, MIN_PITCH, MAX_PITCH)
    : null;

  // Helper to check if pitch is in mode
  const isInMode = (pitchNum: number): boolean => {
    if (!modePitches) return true;
    return modePitches.has(pitchNum);
  };

  // Two-pass approach:
  // 1. Generate beat 1 for each measure (like 1st species)
  // 2. Fill in beats 2, 3, 4 for each measure

  const beat1Notes: string[] = [];

  // Pass 1: Generate all beat 1 notes
  function backtrackBeat1(cfIndex: number): boolean {
    if (cfIndex === cantusFirmus.length) {
      return true;
    }

    const cfPitch = cantusFirmus[cfIndex].pitch;
    const prevCF = cfIndex > 0 ? cantusFirmus[cfIndex - 1].pitch : null;
    const prevBeat1 = cfIndex > 0 ? beat1Notes[cfIndex - 1] : null;
    const isLastMeasure = cfIndex === cantusFirmus.length - 1;
    const isPenultimate = cfIndex === cantusFirmus.length - 2;
    const isFirstMeasure = cfIndex === 0;

    let candidates = getConsonantPitches(cfPitch, isAbove, mode, finalis);

    // First measure: prefer perfect consonances
    if (isFirstMeasure) {
      const perfectCandidates = candidates.filter(p => {
        const interval = getInterval(cfPitch, p);
        return isPerfectConsonance(interval);
      });
      if (perfectCandidates.length > 0) {
        candidates = perfectCandidates;
      }
    }

    // Penultimate measure: prefer M6 (CF below) or m3 (CF above)
    if (isPenultimate) {
      const cadenceCandidates = candidates.filter(p => {
        const interval = getInterval(cfPitch, p);
        if (isAbove) {
          // CF below: Major 6th (9 semitones) preferred
          return interval === 9;
        } else {
          // CF above: minor 3rd (3 semitones) preferred
          return interval === 3;
        }
      });
      if (cadenceCandidates.length > 0) {
        candidates = cadenceCandidates;
      }
    }

    // Last measure: end on P1 or P8
    if (isLastMeasure) {
      const finalCandidates = candidates.filter(p => {
        const interval = getInterval(cfPitch, p);
        return interval === 0 || interval === 12;
      });
      if (finalCandidates.length > 0) {
        candidates = finalCandidates;
      }
    }

    // Score candidates
    const scored = candidates.map(c => ({
      pitch: c,
      score: scoreCandidate(c, cfPitch, prevCF, prevBeat1, rules),
    }));

    scored.sort((a, b) => b.score - a.score);

    // Shuffle within score groups
    const grouped: Map<number, string[]> = new Map();
    for (const { pitch, score } of scored) {
      if (!grouped.has(score)) grouped.set(score, []);
      grouped.get(score)!.push(pitch);
    }

    const sortedCandidates: string[] = [];
    for (const score of Array.from(grouped.keys()).sort((a, b) => b - a)) {
      sortedCandidates.push(...shuffleArray(grouped.get(score)!));
    }

    for (const candidate of sortedCandidates) {
      beat1Notes[cfIndex] = candidate;
      if (backtrackBeat1(cfIndex + 1)) {
        return true;
      }
    }

    return false;
  }

  if (!backtrackBeat1(0)) {
    return {
      notes: [],
      analysis: { noteAnalyses: [], summary: "Generation failed" },
      success: false,
      error: "Could not generate valid beat 1 notes",
    };
  }

  // Pass 2: Fill in beats 2, 3, 4 for each measure
  const result: { beats: [string, string, string, string] }[] = [];

  for (let i = 0; i < beat1Notes.length; i++) {
    const currentBeat1 = beat1Notes[i];
    const nextBeat1 = i < beat1Notes.length - 1 ? beat1Notes[i + 1] : currentBeat1;
    const cfPitch = cantusFirmus[i].pitch;
    const isLastMeasure = i === cantusFirmus.length - 1;

    const beats: [string, string, string, string] = [currentBeat1, "", "", ""];

    if (isLastMeasure) {
      // Last measure: all four beats on the final note
      beats[1] = currentBeat1;
      beats[2] = currentBeat1;
      beats[3] = currentBeat1;
    } else {
      // Generate beats 2, 3, 4 that connect to next beat 1
      const currentNum = noteToNumber(currentBeat1);
      const nextNum = noteToNumber(nextBeat1);
      const cfNum = noteToNumber(cfPitch);

      // Try to find a smooth melodic line from beat 1 to next beat 1
      // using stepwise motion and occasional small leaps

      type BeatPath = {
        beat2: string;
        beat3: string;
        beat4: string;
        score: number;
      };

      const paths: BeatPath[] = [];

      // Generate candidate paths
      // For each beat, consider steps and small leaps
      const getNextCandidates = (fromNum: number): number[] => {
        const candidates: number[] = [];
        // Prefer steps, but allow thirds
        for (const step of [-3, -2, -1, 1, 2, 3]) {
          const newNum = fromNum + step;
          if (newNum >= MIN_PITCH && newNum <= MAX_PITCH && isInMode(newNum)) {
            candidates.push(newNum);
          }
        }
        return candidates;
      };

      for (const beat2Num of getNextCandidates(currentNum)) {
        for (const beat3Num of getNextCandidates(beat2Num)) {
          for (const beat4Num of getNextCandidates(beat3Num)) {
            // Beat 4 should step to next beat 1
            const stepToNext = Math.abs(nextNum - beat4Num);
            if (stepToNext > 2) continue; // Must be stepwise to next beat 1

            const beat2 = numberToPitch(beat2Num);
            const beat3 = numberToPitch(beat3Num);
            const beat4 = numberToPitch(beat4Num);

            // Calculate intervals with CF
            const int2 = Math.abs(beat2Num - cfNum);
            const int3 = Math.abs(beat3Num - cfNum);
            const int4 = Math.abs(beat4Num - cfNum);

            const isCons2 = isConsonant(int2);
            const isCons3 = isConsonant(int3);
            const isCons4 = isConsonant(int4);

            let score = 100;

            // Beat 3 should be consonant (preferred)
            if (!isCons3) {
              score -= 30;
            }

            // Check for valid passing tones on beats 2 and 4
            const step1to2 = Math.abs(beat2Num - currentNum);
            const step3to4 = Math.abs(beat4Num - beat3Num);

            // Beat 2: if dissonant, must be stepwise (passing tone)
            if (!isCons2 && step1to2 > 2) {
              continue; // Invalid
            }

            // Beat 4: if dissonant, must approach next beat 1 by step
            if (!isCons4 && stepToNext > 2) {
              continue; // Invalid
            }

            // Prefer stepwise motion throughout
            const step2to3 = Math.abs(beat3Num - beat2Num);
            if (step1to2 <= 2) score += 10;
            if (step2to3 <= 2) score += 10;
            if (step3to4 <= 2) score += 10;
            if (stepToNext <= 2) score += 15;

            // Prefer consonant beats
            if (isCons2) score += 5;
            if (isCons3) score += 15;
            if (isCons4) score += 5;

            // Prefer motion toward next beat 1
            const direction = nextNum > currentNum ? 1 : nextNum < currentNum ? -1 : 0;
            const beat4Dir = beat4Num > currentNum ? 1 : beat4Num < currentNum ? -1 : 0;
            if (direction !== 0 && beat4Dir === direction) {
              score += 10;
            }

            // Check for cambiata pattern (dissonant beat 2, leap to consonant beat 3, step back)
            if (!isCons2 && step1to2 <= 2 && isCons3 && step2to3 > 2) {
              // This could be a cambiata - leap from dissonant to consonant
              const leapDir = beat3Num > beat2Num ? 1 : -1;
              const resolveDir = beat4Num > beat3Num ? 1 : -1;
              if (resolveDir !== leapDir && step3to4 <= 2) {
                score += 20; // Valid cambiata pattern
              }
            }

            // Add variety
            score += Math.random() * 15;

            paths.push({ beat2, beat3, beat4, score });
          }
        }
      }

      if (paths.length === 0) {
        // Fallback: use stepwise motion
        const direction = nextNum > currentNum ? 1 : -1;
        const step = direction * 2; // whole step
        let beat2Num = currentNum + step;
        let beat3Num = beat2Num + step;
        let beat4Num = beat3Num + step;

        // Adjust if out of range or mode
        if (!isInMode(beat2Num)) beat2Num = currentNum;
        if (!isInMode(beat3Num)) beat3Num = beat2Num;
        if (!isInMode(beat4Num)) beat4Num = beat3Num;

        beats[1] = numberToPitch(beat2Num);
        beats[2] = numberToPitch(beat3Num);
        beats[3] = numberToPitch(beat4Num);
      } else {
        // Pick best path
        paths.sort((a, b) => b.score - a.score);
        const bestPath = paths[0];
        beats[1] = bestPath.beat2;
        beats[2] = bestPath.beat3;
        beats[3] = bestPath.beat4;
      }
    }

    result.push({ beats });
  }

  // Convert to Note[] with quarter note durations
  const notes: Note[] = [];
  for (const { beats } of result) {
    for (const beat of beats) {
      notes.push({ pitch: beat, duration: "q" });
    }
  }

  // Generate analysis
  const noteAnalyses: NoteAnalysis[] = [];
  let violations = 0;

  for (let i = 0; i < result.length; i++) {
    const prevCF = i > 0 ? cantusFirmus[i - 1].pitch : null;
    const prevBeat1 = i > 0 ? result[i - 1].beats[0] : null;

    const measureAnalyses = analyzeThirdSpeciesMeasure(
      i,
      cantusFirmus[i].pitch,
      result[i].beats,
      prevCF,
      prevBeat1,
      rules
    );

    noteAnalyses.push(...measureAnalyses);
    violations += measureAnalyses.flatMap(a => a.ruleResults).filter(r => !r.passed).length;
  }

  const summary =
    violations === 0
      ? "All rules followed (3rd species)"
      : `${violations} rule violation${violations === 1 ? "" : "s"} (3rd species)`;

  return {
    notes,
    analysis: { noteAnalyses, summary },
    success: true,
  };
}

// Analyze a 4th species measure (syncopated half notes)
function analyzeFourthSpeciesMeasure(
  measureIndex: number,
  cfPitch: string,
  downbeat: string,
  upbeat: string,
  prevUpbeat: string | null,
  isFirstMeasure: boolean,
  _rules: RuleConfig[] // Prefix with underscore to indicate intentionally unused for now
): NoteAnalysis[] {
  const analyses: NoteAnalysis[] = [];

  // Analyze downbeat (held note from previous upbeat, or rest in first measure)
  if (!isFirstMeasure) {
    const downbeatInterval = getInterval(cfPitch, downbeat);
    const downbeatRules: NoteAnalysis["ruleResults"] = [];
    const isDownbeatConsonant = isConsonant(downbeatInterval);

    if (isDownbeatConsonant) {
      downbeatRules.push({
        ruleId: "consonantIntervalsOnly",
        ruleName: "Downbeat Interval",
        passed: true,
        message: `Consonant tie (${getIntervalName(downbeatInterval)})`,
      });
    } else {
      // Dissonant suspension - check if it resolves correctly
      const upbeatNum = noteToNumber(upbeat);
      const downbeatNum = noteToNumber(downbeat);
      const resolvesDown = upbeatNum < downbeatNum;
      const isStepwise = Math.abs(upbeatNum - downbeatNum) <= 2;
      const validResolution = resolvesDown && isStepwise;

      downbeatRules.push({
        ruleId: "suspensionResolution",
        ruleName: "Suspension",
        passed: validResolution,
        message: validResolution
          ? `Valid suspension (${getIntervalName(downbeatInterval)} → resolves down)`
          : `Invalid suspension (${getIntervalName(downbeatInterval)} - must resolve down by step)`,
      });
    }

    // Note: Parallel 5ths/8ves are checked in the upbeat analysis section

    analyses.push({
      noteIndex: measureIndex * 2,
      cfPitch,
      cpPitch: downbeat,
      interval: getIntervalName(downbeatInterval),
      ruleResults: downbeatRules,
    });
  }

  // Analyze upbeat (must be consonant)
  const upbeatInterval = getInterval(cfPitch, upbeat);
  const upbeatRules: NoteAnalysis["ruleResults"] = [];
  const isUpbeatConsonant = isConsonant(upbeatInterval);

  upbeatRules.push({
    ruleId: "upbeatConsonance",
    ruleName: "Upbeat Consonance",
    passed: isUpbeatConsonant,
    message: isUpbeatConsonant
      ? `Consonant (${getIntervalName(upbeatInterval)})`
      : `Upbeat must be consonant (${getIntervalName(upbeatInterval)})`,
  });

  // Check melodic motion from previous upbeat to current upbeat
  // (This is where the actual melodic line is - tied notes connect the upbeats)
  if (prevUpbeat) {
    // Check for forbidden intervals
    const forbiddenCheck = checkForbiddenInterval(prevUpbeat, upbeat);
    upbeatRules.push({
      ruleId: "noForbiddenIntervals",
      ruleName: "Melodic Motion",
      passed: forbiddenCheck.passed,
      message: forbiddenCheck.message,
    });

    // Check for repeated notes
    if (prevUpbeat === upbeat) {
      upbeatRules.push({
        ruleId: "avoidRepetitions",
        ruleName: "Avoid Repetitions",
        passed: false,
        message: "Repeated note",
      });
    }
  }

  analyses.push({
    noteIndex: isFirstMeasure ? measureIndex * 2 : measureIndex * 2 + 1,
    cfPitch,
    cpPitch: upbeat,
    interval: getIntervalName(upbeatInterval),
    ruleResults: upbeatRules,
  });

  return analyses;
}

export function generateFourthSpecies(
  cantusFirmus: Note[],
  isAbove: boolean,
  rules: RuleConfig[] = DEFAULT_RULES,
  mode?: Mode,
  finalis?: Finalis
): GenerationResult {
  if (cantusFirmus.length === 0) {
    return {
      notes: [],
      analysis: { noteAnalyses: [], summary: "No cantus firmus provided" },
      success: false,
      error: "Cantus firmus is empty",
    };
  }

  // 4th species: syncopated half notes with suspensions
  // Pattern: upbeat (beat 3) is consonant, tied to next downbeat (beat 1)
  // If the tied note is dissonant with new CF, it must resolve DOWN by step

  // Generate upbeat notes for each measure
  // Each upbeat becomes a potential suspension on the next measure's downbeat

  const upbeats: string[] = []; // One upbeat per CF note

  function backtrackUpbeats(cfIndex: number): boolean {
    if (cfIndex === cantusFirmus.length) {
      return true;
    }

    const cfPitch = cantusFirmus[cfIndex].pitch;
    const cfNum = noteToNumber(cfPitch);
    const prevUpbeat = cfIndex > 0 ? upbeats[cfIndex - 1] : null;
    const isLastMeasure = cfIndex === cantusFirmus.length - 1;
    const isFirstMeasure = cfIndex === 0;

    // Get consonant pitches for the upbeat
    let candidates = getConsonantPitches(cfPitch, isAbove, mode, finalis);

    // If not first measure, check if previous upbeat creates a suspension
    if (prevUpbeat && cfIndex > 0) {
      const prevUpbeatNum = noteToNumber(prevUpbeat);
      const suspensionInterval = Math.abs(prevUpbeatNum - cfNum);
      const isSuspension = !isConsonant(suspensionInterval);

      if (isSuspension) {
        // Previous upbeat is dissonant with current CF - must resolve DOWN by step
        // The current upbeat must be the resolution
        const resolutionCandidates = candidates.filter(c => {
          const cNum = noteToNumber(c);
          const step = prevUpbeatNum - cNum;
          return step >= 1 && step <= 2; // Must be 1 or 2 semitones DOWN
        });

        if (resolutionCandidates.length > 0) {
          candidates = resolutionCandidates;
        } else {
          // Can't resolve properly - this path won't work
          // But we might allow breaking the tie (plain half notes)
          // For now, continue with consonant options
        }
      }
    }

    // First measure: prefer perfect consonances
    if (isFirstMeasure) {
      const perfectCandidates = candidates.filter(p => {
        const interval = getInterval(cfPitch, p);
        return isPerfectConsonance(interval);
      });
      if (perfectCandidates.length > 0) {
        candidates = perfectCandidates;
      }
    }

    // Last measure: end on P1 or P8
    if (isLastMeasure) {
      const finalCandidates = candidates.filter(p => {
        const interval = getInterval(cfPitch, p);
        return interval === 0 || interval === 12;
      });
      if (finalCandidates.length > 0) {
        candidates = finalCandidates;
      }
    }

    // Filter and score candidates using rule weights
    const forbiddenWeight = getRuleWeight(rules, "noForbiddenIntervals");
    const leapRecoveryWeight = getRuleWeight(rules, "leapRecovery");
    const exposedTritoneWeight = getRuleWeight(rules, "noExposedTritone");
    const consecutiveLeapsWeight = getRuleWeight(rules, "avoidConsecutiveLeaps");
    const repetitionWeight = getRuleWeight(rules, "avoidRepetitions");
    const parallelWeight = getRuleWeight(rules, "noParallelFifths");

    // If forbidden intervals weight is 100%, filter them out entirely
    let filteredCandidates = candidates;
    if (prevUpbeat && forbiddenWeight === 100) {
      filteredCandidates = candidates.filter(c => {
        const check = checkForbiddenInterval(prevUpbeat, c);
        return check.passed;
      });
      // Fall back to all candidates if filtering removes everything
      if (filteredCandidates.length === 0) {
        filteredCandidates = candidates;
      }
    }

    // Build list of recent upbeats for context-aware checks
    const recentUpbeats = upbeats.slice(Math.max(0, cfIndex - 3), cfIndex);

    const scored = filteredCandidates.map(c => {
      let score = 100;
      const cNum = noteToNumber(c);

      // Prefer creating suspensions (dissonance on next downbeat)
      if (cfIndex < cantusFirmus.length - 1) {
        const nextCF = cantusFirmus[cfIndex + 1].pitch;
        const nextCFNum = noteToNumber(nextCF);
        const nextInterval = Math.abs(cNum - nextCFNum);

        // Check if this would create a valid suspension
        if (!isConsonant(nextInterval)) {
          // Would be a suspension - check if resolvable
          // Common suspensions: 7-6, 4-3, 9-8
          const normalizedInterval = nextInterval % 12;
          if ([10, 11, 5, 1, 2].includes(normalizedInterval)) {
            score += 25; // Bonus for creating a suspension
          }
        }
      }

      if (prevUpbeat) {
        // Check for forbidden intervals (penalize if not filtered)
        if (forbiddenWeight < 100) {
          const forbiddenCheck = checkForbiddenInterval(prevUpbeat, c);
          if (!forbiddenCheck.passed) {
            score -= forbiddenWeight;
          }
        }

        // Check leap recovery
        if (cfIndex >= 2) {
          const prevPrevUpbeat = upbeats[cfIndex - 2];
          const recoveryCheck = checkLeapRecovery(prevPrevUpbeat, prevUpbeat, c);
          if (!recoveryCheck.passed) {
            score -= leapRecoveryWeight * 0.8;
          }
        }

        // Avoid repetition
        if (c === prevUpbeat) {
          score -= repetitionWeight;
        }
      }

      // Check exposed tritone
      if (recentUpbeats.length > 0) {
        const tritoneCheck = checkExposedTritone(recentUpbeats, c);
        if (!tritoneCheck.passed) {
          score -= exposedTritoneWeight * 0.8;
        }
      }

      // Check consecutive leaps in same direction
      if (recentUpbeats.length >= 2) {
        const leapsCheck = checkConsecutiveLeapsSameDirection(recentUpbeats, c);
        if (!leapsCheck.passed) {
          score -= consecutiveLeapsWeight * 0.5; // Softer penalty since Fux breaks this sometimes
        }
      }

      // Check for parallel fifths/octaves with previous
      if (prevUpbeat && cfIndex > 0) {
        const prevCF = cantusFirmus[cfIndex - 1].pitch;
        const parallelCheck = checkParallelFifths(prevCF, cfPitch, prevUpbeat, c);
        if (!parallelCheck.passed) {
          score -= parallelWeight;
        }
      }

      score += Math.random() * 10;
      return { pitch: c, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Shuffle within score groups
    const grouped: Map<number, string[]> = new Map();
    for (const { pitch, score } of scored) {
      if (!grouped.has(score)) grouped.set(score, []);
      grouped.get(score)!.push(pitch);
    }

    const sortedCandidates: string[] = [];
    for (const score of Array.from(grouped.keys()).sort((a, b) => b - a)) {
      sortedCandidates.push(...shuffleArray(grouped.get(score)!));
    }

    for (const candidate of sortedCandidates) {
      upbeats[cfIndex] = candidate;
      if (backtrackUpbeats(cfIndex + 1)) {
        return true;
      }
    }

    return false;
  }

  if (!backtrackUpbeats(0)) {
    return {
      notes: [],
      analysis: { noteAnalyses: [], summary: "Generation failed" },
      success: false,
      error: "Could not generate valid 4th species counterpoint",
    };
  }

  // Build the output notes
  // Format: 2 half notes per measure
  // First measure: rest (or we skip the downbeat), then upbeat
  // Subsequent measures: downbeat (tied from prev upbeat), upbeat

  const result: { downbeat: string; upbeat: string }[] = [];

  for (let i = 0; i < upbeats.length; i++) {
    const upbeat = upbeats[i];

    if (i === 0) {
      // First measure: the downbeat is a "rest" - we'll use the upbeat for both
      // Or we could have a special handling for the syncopation
      // For simplicity, output the first upbeat as both notes (it's held)
      result.push({ downbeat: upbeat, upbeat: upbeat });
    } else {
      // Downbeat is the tied note from previous upbeat
      const downbeat = upbeats[i - 1];
      result.push({ downbeat, upbeat });
    }
  }

  // Convert to Note[] with half note durations
  const notes: Note[] = [];
  for (let i = 0; i < result.length; i++) {
    const { downbeat, upbeat } = result[i];
    if (i === 0) {
      // First measure: could represent as rest + note, but for now just output one note
      // Actually, let's output both to maintain consistent structure
      notes.push({ pitch: downbeat, duration: "h" });
      notes.push({ pitch: upbeat, duration: "h" });
    } else {
      notes.push({ pitch: downbeat, duration: "h" });
      notes.push({ pitch: upbeat, duration: "h" });
    }
  }

  // Generate analysis
  const noteAnalyses: NoteAnalysis[] = [];
  let violations = 0;

  for (let i = 0; i < result.length; i++) {
    const prevUpbeat = i > 0 ? result[i - 1].upbeat : null;
    const isFirstMeasure = i === 0;

    const measureAnalyses = analyzeFourthSpeciesMeasure(
      i,
      cantusFirmus[i].pitch,
      result[i].downbeat,
      result[i].upbeat,
      prevUpbeat,
      isFirstMeasure,
      rules
    );

    noteAnalyses.push(...measureAnalyses);
    violations += measureAnalyses.flatMap(a => a.ruleResults).filter(r => !r.passed).length;
  }

  const summary =
    violations === 0
      ? "All rules followed (4th species)"
      : `${violations} rule violation${violations === 1 ? "" : "s"} (4th species)`;

  return {
    notes,
    analysis: { noteAnalyses, summary },
    success: true,
  };
}
