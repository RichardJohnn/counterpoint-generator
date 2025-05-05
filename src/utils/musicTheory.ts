import { StaveNote } from "vexflow";
import { Measure, Note, NoteDurationMap, TimeSignature } from "../types";

export function createVexFlowNote(note: Note, clef = "treble"): StaveNote {
  const { pitch, duration } = note;

  const pitchName = pitch.slice(0, -1);
  const octave = pitch.slice(-1);

  return new StaveNote({
    keys: [`${pitchName}/${octave}`],
    duration: duration,
    clef,
  });
}

const PITCH_VALUES: Record<string, number> = {
  C: 0,
  "C#": 1,
  DB: 1,
  D: 2,
  "D#": 3,
  EB: 3,
  E: 4,
  F: 5,
  "F#": 6,
  GB: 6,
  G: 7,
  "G#": 8,
  AB: 8,
  A: 9,
  "A#": 10,
  BB: 10,
  B: 11,
};

export function noteToNumber(noteName: string): number {
  const pitch = noteName.slice(0, -1).toUpperCase();
  const octave = parseInt(noteName.slice(-1), 10);
  return octave * 12 + (PITCH_VALUES[pitch] || 0);
}

export function isNoteInRange(
  note: string,
  minNote = "E2",
  maxNote = "F#5"
): boolean {
  const noteValue = noteToNumber(note);
  const minValue = noteToNumber(minNote);
  const maxValue = noteToNumber(maxNote);

  return noteValue >= minValue && noteValue <= maxValue;
}

export function createDurationMap(beatUnit: number): NoteDurationMap {
  switch (beatUnit) {
    case 2:
      return {
        w: 2,
        h: 1,
        q: 0.5,
        "8": 0.25,
        "16": 0.125,
      };
    case 8:
      return {
        w: 8,
        h: 4,
        q: 2,
        "8": 1,
        "16": 0.5,
      };
    case 4:
    default:
      return {
        w: 4,
        h: 2,
        q: 1,
        "8": 0.5,
        "16": 0.25,
      };
  }
}

export function durationToBeats(duration: string, beatUnit = 4): number {
  const durationMap = createDurationMap(beatUnit);

  if (duration.includes("d")) {
    const baseDuration = duration.replace("d", "");
    return durationMap[baseDuration] * 1.5;
  }

  return durationMap[duration] || 0;
}

export function parseTimeSignature(timeSignature: TimeSignature): [number, number] {
  if (timeSignature === "C") return [4, 4];
  if (timeSignature === "C|") return [2, 2];

  const parts = timeSignature.split("/").map(Number);
  return [parts[0], parts[1]]
}

export function organizeNotesIntoMeasures(
  notes: Note[],
  timeSignature = "C"
): Measure[] {
  const measures: Measure[] = [];
  const [beatsPerMeasure, beatUnit] = parseTimeSignature(timeSignature);

  let currentMeasure: Note[] = [];
  let currentBeats = 0;

  for (const note of notes) {
    const noteBeats = durationToBeats(note.duration, beatUnit);

    if (currentBeats + noteBeats > beatsPerMeasure) {
      measures.push({ notes: currentMeasure });
      currentMeasure = [note];
      currentBeats = noteBeats;
    } else {
      currentMeasure.push(note);
      currentBeats += noteBeats;
    }
  }

  if (currentMeasure.length > 0) {
    measures.push({ notes: currentMeasure });
  }

  return measures;
}

export function validateCantusFirmus(notes: Note[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (notes.length === 0) {
    errors.push("Cantus firmus must contain at least one note.");
  }

  for (let i = 0; i < notes.length; i++) {
    const { pitch } = notes[i];
    if (!isNoteInRange(pitch)) {
      errors.push(
        `Note ${pitch} at position ${
          i + 1
        } is outside the valid range (E2-F#5).`
      );
    }
  }

  if (notes.length > 1 && notes[0].pitch !== notes[notes.length - 1].pitch) {
    errors.push("Cantus firmus should begin and end on the same note.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
