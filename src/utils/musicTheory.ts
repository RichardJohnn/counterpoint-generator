import { StaveNote } from "vexflow";
import { Measure, Note } from "../types";

export function createVexFlowNote(note: Note, clef="treble"): StaveNote {
  const { pitch, duration } = note;

  const pitchName = pitch.slice(0, -1);
  const octave = pitch.slice(-1);

  return new StaveNote({
    keys: [`${pitchName}/${octave}`],
    duration: duration,
    clef
  });
}

export function isNoteInRange(
  note: string,
  minNote = "E2",
  maxNote = "F#5"
): boolean {
  function noteToNumber(noteName: string): number {
    const pitch = noteName.slice(0, -1).toUpperCase();
    const octave = parseInt(noteName.slice(-1), 10);

    const pitchValues: { [key: string]: number } = {
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

    return octave * 12 + (pitchValues[pitch] || 0);
  }

  const noteValue = noteToNumber(note);
  const minValue = noteToNumber(minNote);
  const maxValue = noteToNumber(maxNote);

  return noteValue >= minValue && noteValue <= maxValue;
}

export function organizeNotesIntoMeasures(
  notes: Note[],
  timeSignature = "C"
): Measure[] {
  const measures: Measure[] = [];
  const [beatsPerMeasure, beatUnit] =
    timeSignature === "C"
      ? [4, 4]
      : timeSignature === "C|"
      ? [2, 2]
      : timeSignature.split("/").map(Number);

  let currentMeasure: Note[] = [];
  let currentBeats = 0;

  function durationToBeats(duration: string): number {
    const durationMap: { [key: string]: number } = beatUnit === 4 ? {
      w: 4,
      h: 2,
      q: 1,
      "8": 0.5,
      "16": 0.25,
    } : beatUnit === 2 ? {
      w: 2,
      h: 1,
      q: 0.5,
      "8": 0.25,
      "16": 0.125,
    } : beatUnit === 8 ? {
      w: 8,
      h: 4,
      q: 2,
      "8": 1,
      "16": 0.5,
    } : {
      w: 4,
      h: 2,
      q: 1,
      "8": 0.5,
      "16": 0.25,
    };

    if (duration.includes("d")) {
      const baseDuration = duration.replace("d", "");
      return durationMap[baseDuration] * 1.5;
    }

    return durationMap[duration] || 0;
  }

  for (const note of notes) {
    const noteBeats = durationToBeats(note.duration);

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

  // TODO: Allow different octaves than C4-C5
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
