import { Note, Mode, Finalis, MODE_INTERVALS } from "../types";

interface CFGeneratorConfig {
  measures?: number;
  mode?: Mode;
  finalis?: Finalis;
}

// Note names in order
const NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"];

// Convert pitch string to MIDI note number
function pitchToMidi(pitch: string): number {
  const match = pitch.match(/^([A-G])([#b]?)(\d)$/);
  if (!match) return 60; // Default to middle C

  const [, noteName, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr);
  const noteIndex = NOTE_NAMES.indexOf(noteName);

  // C4 = 60
  let midi = (octave + 1) * 12 + [0, 2, 4, 5, 7, 9, 11][noteIndex];

  if (accidental === "#") midi += 1;
  if (accidental === "b") midi -= 1;

  return midi;
}

// Convert MIDI note number to pitch string (natural notes only for CF)
function midiToPitch(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteInOctave = midi % 12;

  // Map to nearest natural note
  const naturalNotes = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
  let closest = 0;
  let minDist = Math.abs(noteInOctave - naturalNotes[0]);

  for (let i = 1; i < naturalNotes.length; i++) {
    const dist = Math.abs(noteInOctave - naturalNotes[i]);
    if (dist < minDist) {
      minDist = dist;
      closest = i;
    }
  }

  return `${NOTE_NAMES[closest]}${octave}`;
}

// Get scale degree pitches for a given finalis and mode
function getScalePitches(finalis: string, mode: Mode): number[] {
  const finalisMidi = pitchToMidi(finalis);
  const intervals = MODE_INTERVALS[mode];

  // Generate scale pitches across 2 octaves
  const pitches: number[] = [];
  for (let octaveOffset = -1; octaveOffset <= 1; octaveOffset++) {
    for (const interval of intervals) {
      pitches.push(finalisMidi + interval + octaveOffset * 12);
    }
  }

  return [...new Set(pitches)].sort((a, b) => a - b);
}

// Calculate interval in half steps between two MIDI notes
function getInterval(midi1: number, midi2: number): number {
  return Math.abs(midi2 - midi1);
}

// Check if interval is forbidden
function isForbiddenInterval(interval: number): boolean {
  return interval === 6 || // tritone
    interval === 10 || // minor 7th
    interval === 11 || // major 7th
    interval > 12; // greater than octave
}

// Check if melody outlines a tritone (looks at recent notes)
function outlinesTritone(notes: number[], newNote: number): boolean {
  if (notes.length < 2) return false;

  // Check if adding this note would create a tritone outline
  // Look at the last few notes for tritone patterns
  const recentNotes = [...notes.slice(-3), newNote];

  for (let i = 0; i < recentNotes.length - 1; i++) {
    for (let j = i + 1; j < recentNotes.length; j++) {
      if (getInterval(recentNotes[i], recentNotes[j]) === 6) {
        return true;
      }
    }
  }

  return false;
}

// Check direction (1 = up, -1 = down, 0 = same)
function getDirection(from: number, to: number): number {
  if (to > from) return 1;
  if (to < from) return -1;
  return 0;
}

// Count consecutive notes in same direction
function countSameDirection(notes: number[]): number {
  if (notes.length < 2) return 0;

  let count = 0;
  let lastDir = getDirection(notes[notes.length - 2], notes[notes.length - 1]);

  for (let i = notes.length - 2; i > 0; i--) {
    const dir = getDirection(notes[i - 1], notes[i]);
    if (dir === lastDir && dir !== 0) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

// Get valid next notes based on rules
function getValidNextNotes(
  currentMelody: number[],
  scalePitches: number[],
  climaxNote: number,
  climaxIndex: number,
  currentIndex: number,
  totalMeasures: number,
  tonicMidi: number
): number[] {
  if (currentMelody.length === 0) return [tonicMidi];

  const lastNote = currentMelody[currentMelody.length - 1];
  const validNotes: number[] = [];

  // Determine preferred direction based on position
  const sameDirectionCount = countSameDirection(currentMelody);
  const needsDirectionChange = sameDirectionCount >= 3;

  // Check if last move was a large leap that needs step resolution
  let needsStepDown = false;
  let needsStepUp = false;

  if (currentMelody.length >= 2) {
    const prevNote = currentMelody[currentMelody.length - 2];
    const lastInterval = getInterval(prevNote, lastNote);
    const lastDirection = getDirection(prevNote, lastNote);

    // After leap up by m6 or octave, step down
    if (lastDirection === 1 && (lastInterval >= 8)) {
      needsStepDown = true;
    }
    // After leap down by octave, step up
    if (lastDirection === -1 && lastInterval === 12) {
      needsStepUp = true;
    }
  }

  for (const pitch of scalePitches) {
    const interval = getInterval(lastNote, pitch);
    const direction = getDirection(lastNote, pitch);

    // Skip same note (no unisons in succession)
    if (interval === 0) continue;

    // Skip forbidden intervals
    if (isForbiddenInterval(interval)) continue;

    // Check tritone outline
    if (outlinesTritone(currentMelody, pitch)) continue;

    // Enforce step resolution after large leaps
    if (needsStepDown && (direction !== -1 || interval > 2)) continue;
    if (needsStepUp && (direction !== 1 || interval > 2)) continue;

    // Before climax, don't exceed climax note
    if (currentIndex < climaxIndex && pitch > climaxNote) continue;

    // At climax position, must be the climax note
    if (currentIndex === climaxIndex && pitch !== climaxNote) continue;

    // After climax, don't reach climax again
    if (currentIndex > climaxIndex && pitch >= climaxNote) continue;

    // Penultimate note should step to final (which is tonic)
    if (currentIndex === totalMeasures - 2) {
      // Should be a step away from tonic
      const stepToTonic = getInterval(pitch, tonicMidi);
      if (stepToTonic !== 1 && stepToTonic !== 2) continue;
    }

    // Encourage direction change if needed
    if (needsDirectionChange && currentMelody.length >= 2) {
      const prevDir = getDirection(
        currentMelody[currentMelody.length - 2],
        lastNote
      );
      if (direction === prevDir) {
        // Lower priority but still valid - we'll handle this with scoring
      }
    }

    // Keep melody in reasonable range (about an octave from tonic)
    if (pitch < tonicMidi - 5 || pitch > tonicMidi + 12) continue;

    validNotes.push(pitch);
  }

  return validNotes;
}

// Score a candidate note (higher = better)
function scoreNote(
  note: number,
  currentMelody: number[],
  _climaxNote: number,
  currentIndex: number,
  climaxIndex: number,
  _tonicMidi: number
): number {
  let score = 100;

  if (currentMelody.length === 0) return score;

  const lastNote = currentMelody[currentMelody.length - 1];
  const interval = getInterval(lastNote, note);
  const direction = getDirection(lastNote, note);

  // Prefer stepwise motion (intervals of 1-2 half steps)
  if (interval <= 2) {
    score += 30;
  } else if (interval <= 4) {
    score += 15;
  } else if (interval <= 7) {
    score += 5;
  }

  // Encourage variety in direction
  if (currentMelody.length >= 2) {
    const prevDir = getDirection(
      currentMelody[currentMelody.length - 2],
      lastNote
    );
    if (direction !== prevDir && direction !== 0) {
      score += 20; // Reward direction change
    }
  }

  // Gradual approach to climax
  if (currentIndex < climaxIndex) {
    // Before climax, slight preference for ascending
    if (direction === 1) score += 5;
  } else if (currentIndex > climaxIndex) {
    // After climax, slight preference for descending toward tonic
    if (direction === -1) score += 5;
  }

  // Add some randomness
  score += Math.random() * 20;

  return score;
}

// Main generator function
export function generateCantusFirmus(config: CFGeneratorConfig = {}): Note[] {
  const {
    measures = Math.floor(Math.random() * 7) + 8, // 8-14 measures
    mode = "dorian",
    finalis = "D",
  } = config;

  // Use octave 4 for the finalis (middle register)
  const startingPitch = `${finalis}4`;
  const finalisMidi = pitchToMidi(startingPitch);
  const scalePitches = getScalePitches(startingPitch, mode);

  // Determine climax position (around 70% through, but not in last 2 measures)
  const climaxIndex = Math.min(
    Math.floor(measures * 0.7),
    measures - 3
  );

  // Determine climax note (highest note, within reasonable range)
  // Pick from upper part of scale, about 5-8 half steps above finalis
  const climaxCandidates = scalePitches.filter(
    (p) => p > finalisMidi + 4 && p <= finalisMidi + 9
  );
  const climaxNote =
    climaxCandidates[Math.floor(Math.random() * climaxCandidates.length)] ||
    finalisMidi + 7;

  // Generate melody with backtracking
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const melody: number[] = [finalisMidi]; // Start on finalis

    let success = true;

    for (let i = 1; i < measures - 1; i++) {
      const validNotes = getValidNextNotes(
        melody,
        scalePitches,
        climaxNote,
        climaxIndex,
        i,
        measures,
        finalisMidi
      );

      if (validNotes.length === 0) {
        success = false;
        break;
      }

      // Score and select
      const scored = validNotes.map((note) => ({
        note,
        score: scoreNote(note, melody, climaxNote, i, climaxIndex, finalisMidi),
      }));

      scored.sort((a, b) => b.score - a.score);

      // Pick from top candidates with some randomness
      const topCount = Math.min(3, scored.length);
      const selected = scored[Math.floor(Math.random() * topCount)].note;

      melody.push(selected);
    }

    if (!success) continue;

    // Add final note (must be finalis)
    melody.push(finalisMidi);

    // Validate the complete melody
    if (validateCantusFirmus(melody, climaxNote, climaxIndex)) {
      // Convert to Note objects
      return melody.map((midi) => ({
        pitch: midiToPitch(midi),
        duration: "w" as const,
      }));
    }
  }

  // Fallback: return a simple valid cantus firmus using scale degrees
  // Get scale degrees 1, 2, 3, 4, 5 from the mode
  const intervals = MODE_INTERVALS[mode];
  return [
    { pitch: startingPitch, duration: "w" },                           // 1
    { pitch: midiToPitch(finalisMidi + intervals[1]), duration: "w" }, // 2
    { pitch: midiToPitch(finalisMidi + intervals[2]), duration: "w" }, // 3
    { pitch: midiToPitch(finalisMidi + intervals[3]), duration: "w" }, // 4
    { pitch: midiToPitch(finalisMidi + intervals[4]), duration: "w" }, // 5 (climax)
    { pitch: midiToPitch(finalisMidi + intervals[3]), duration: "w" }, // 4
    { pitch: midiToPitch(finalisMidi + intervals[2]), duration: "w" }, // 3
    { pitch: midiToPitch(finalisMidi + intervals[1]), duration: "w" }, // 2
    { pitch: startingPitch, duration: "w" },                           // 1
  ];
}

// Validate a complete cantus firmus
function validateCantusFirmus(
  melody: number[],
  _expectedClimax: number,
  _climaxIndex: number
): boolean {
  if (melody.length < 8) return false;

  // Check start and end are the same
  if (melody[0] !== melody[melody.length - 1]) return false;

  // Check climax is at expected position and is the highest note
  const maxNote = Math.max(...melody);
  const maxNoteIndex = melody.indexOf(maxNote);

  // Climax should be unique (only one highest note)
  if (melody.filter((n) => n === maxNote).length > 1) return false;

  // Climax should be in the right region
  if (maxNoteIndex < melody.length / 2 || maxNoteIndex >= melody.length - 2) {
    return false;
  }

  // Check for forbidden intervals
  for (let i = 0; i < melody.length - 1; i++) {
    const interval = getInterval(melody[i], melody[i + 1]);
    if (isForbiddenInterval(interval)) return false;
  }

  return true;
}
