import { describe, it, expect, vi } from "vitest";
import {
  createVexFlowNote,
  isNoteInRange,
  noteToNumber,
  organizeNotesIntoMeasures,
  validateCantusFirmus,
  durationToBeats,
  createDurationMap,
  parseTimeSignature,
} from "../musicTheory";
import { Note } from "../../types";

type MockStaveNote = {
  keys: string[];
  getDuration: () => string;
  getClef: () => string;
}

vi.mock("vexflow", () => ({
  StaveNote: vi.fn().mockImplementation((options) => {
    return {
      keys: options.keys,
      getClef: () => options.clef,
      getDuration: () => options.duration,
    } as MockStaveNote;
  }),
}));

describe("noteToNumber", () => {
  it("should convert notes to numeric values correctly", () => {
    expect(noteToNumber("C4")).toBe(48 + 0);
    expect(noteToNumber("C#4")).toBe(48 + 1);
    expect(noteToNumber("DB4")).toBe(48 + 1);
    expect(noteToNumber("G3")).toBe(36 + 7);
    expect(noteToNumber("F#5")).toBe(60 + 6);
    expect(noteToNumber("E2")).toBe(24 + 4);
  });

  it("should handle lowercase pitch names", () => {
    expect(noteToNumber("c4")).toBe(48 + 0);
    expect(noteToNumber("f#3")).toBe(36 + 6);
  });

  it("should return 0 for unknown pitch names", () => {
    expect(noteToNumber("Z4")).toBe(48 + 0); // Only uses the octave number
  });
});

describe("isNoteInRange", () => {
  it("should correctly identify notes in the default range", () => {
    expect(isNoteInRange("E2")).toBe(true);
    expect(isNoteInRange("C4")).toBe(true);
    expect(isNoteInRange("F#5")).toBe(true);
    expect(isNoteInRange("D2")).toBe(false);
    expect(isNoteInRange("G5")).toBe(false);
  });

  it("should work with custom ranges", () => {
    expect(isNoteInRange("C4", "C4", "C5")).toBe(true);
    expect(isNoteInRange("B3", "C4", "C5")).toBe(false);
    expect(isNoteInRange("D5", "C4", "C5")).toBe(false);
  });
});

describe("createVexFlowNote", () => {
  it("should create a StaveNote with the correct properties", () => {
    const note: Note = { pitch: "C4", duration: "q" };
    const staveNote = createVexFlowNote(note) as unknown as MockStaveNote;

    expect(staveNote.keys).toEqual(["C/4"]);
    expect(staveNote.getDuration()).toBe("q");
    expect(staveNote.getClef()).toBe("treble");
  });

  it("should use the provided clef", () => {
    const note: Note = { pitch: "F3", duration: "h" };
    const staveNote = createVexFlowNote(note, "bass") as unknown as MockStaveNote;

    expect(staveNote.keys).toEqual(["F/3"]);
    expect(staveNote.getClef()).toBe("bass");
  });

  it("should handle accidentals in pitch", () => {
    const note: Note = { pitch: "F#4", duration: "q" };
    const staveNote = createVexFlowNote(note);

    expect(staveNote.keys).toEqual(["F#/4"]);
  });
});

describe("createDurationMap", () => {
  it("should create correct duration map for beat unit 4", () => {
    const map = createDurationMap(4);
    expect(map).toEqual({
      w: 4,
      h: 2,
      q: 1,
      "8": 0.5,
      "16": 0.25,
    });
  });

  it("should create correct duration map for beat unit 2", () => {
    const map = createDurationMap(2);
    expect(map).toEqual({
      w: 2,
      h: 1,
      q: 0.5,
      "8": 0.25,
      "16": 0.125,
    });
  });

  it("should create correct duration map for beat unit 8", () => {
    const map = createDurationMap(8);
    expect(map).toEqual({
      w: 8,
      h: 4,
      q: 2,
      "8": 1,
      "16": 0.5,
    });
  });
});

describe("durationToBeats", () => {
  it("should convert standard durations correctly with default beat unit", () => {
    expect(durationToBeats("w")).toBe(4);
    expect(durationToBeats("h")).toBe(2);
    expect(durationToBeats("q")).toBe(1);
    expect(durationToBeats("8")).toBe(0.5);
    expect(durationToBeats("16")).toBe(0.25);
  });

  it("should handle dotted notes", () => {
    expect(durationToBeats("hd")).toBe(3);
    expect(durationToBeats("qd")).toBe(1.5);
  });

  it("should support different beat units", () => {
    expect(durationToBeats("q", 2)).toBe(0.5);
    expect(durationToBeats("q", 8)).toBe(2);
  });

  it("should return 0 for unknown durations", () => {
    expect(durationToBeats("xyz")).toBe(0);
  });
});

describe("parseTimeSignature", () => {
  it("should parse common time signatures", () => {
    expect(parseTimeSignature("C")).toEqual([4, 4]);
    expect(parseTimeSignature("C|")).toEqual([2, 2]);
    expect(parseTimeSignature("4/4")).toEqual([4, 4]);
    expect(parseTimeSignature("2/2")).toEqual([2, 2]);
    expect(parseTimeSignature("3/4")).toEqual([3, 4]);
    expect(parseTimeSignature("6/8")).toEqual([6, 8]);
  });
});

describe("organizeNotesIntoMeasures", () => {
  it("should correctly organize notes into 4/4 measures", () => {
    const notes: Note[] = [
      { pitch: "C4", duration: "q" },
      { pitch: "D4", duration: "q" },
      { pitch: "E4", duration: "h" },
      { pitch: "F4", duration: "w" },
    ];

    const measures = organizeNotesIntoMeasures(notes);

    expect(measures).toHaveLength(2);
    expect(measures[0].notes).toHaveLength(3);
    expect(measures[1].notes).toHaveLength(1);
  });

  it("should handle dotted notes correctly", () => {
    const notes: Note[] = [
      { pitch: "C4", duration: "qd" }, // 1.5 beats
      { pitch: "D4", duration: "8" }, // 0.5 beats
      { pitch: "E4", duration: "h" }, // 2 beats
      { pitch: "F4", duration: "q" }, // 1 beat
      { pitch: "G4", duration: "q" }, // 1 beat
    ];

    const measures = organizeNotesIntoMeasures(notes);

    expect(measures).toHaveLength(2);
    expect(measures[0].notes).toHaveLength(3);
    expect(measures[1].notes).toHaveLength(2);
  });

  it("should work with different time signatures", () => {
    const notes: Note[] = [
      { pitch: "C4", duration: "q" },
      { pitch: "D4", duration: "q" },
      { pitch: "E4", duration: "q" },
    ];

    const measures = organizeNotesIntoMeasures(notes, "3/4");

    expect(measures).toHaveLength(1);
    expect(measures[0].notes).toHaveLength(3);
  });

  it("should handle empty note arrays", () => {
    const measures = organizeNotesIntoMeasures([]);
    expect(measures).toHaveLength(0);
  });
});

describe("validateCantusFirmus", () => {
  it("should validate a correct cantus firmus", () => {
    const notes: Note[] = [
      { pitch: "D4", duration: "w" },
      { pitch: "E4", duration: "w" },
      { pitch: "F4", duration: "w" },
      { pitch: "D4", duration: "w" },
    ];

    const result = validateCantusFirmus(notes);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect empty cantus firmus", () => {
    const result = validateCantusFirmus([]);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Cantus firmus must contain at least one note."
    );
  });

  it("should detect notes out of range", () => {
    const notes: Note[] = [
      { pitch: "D4", duration: "w" },
      { pitch: "G5", duration: "w" }, // Out of range
      { pitch: "D4", duration: "w" },
    ];

    const result = validateCantusFirmus(notes);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Note G5 at position 2 is outside the valid range (E2-F#5)."
    );
  });

  it("should check if cantus firmus begins and ends on the same note", () => {
    const notes: Note[] = [
      { pitch: "D4", duration: "w" },
      { pitch: "E4", duration: "w" },
      { pitch: "F4", duration: "w" },
    ];

    const result = validateCantusFirmus(notes);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Cantus firmus should begin and end on the same note."
    );
  });

  it("should report multiple errors if present", () => {
    const notes: Note[] = [
      { pitch: "D4", duration: "w" },
      { pitch: "G5", duration: "w" }, // Out of range
      { pitch: "F4", duration: "w" },
    ];

    const result = validateCantusFirmus(notes);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
