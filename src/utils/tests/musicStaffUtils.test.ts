import { describe, it, expect, vi, beforeEach } from "vitest";
import * as Vex from "vexflow";
import {
  drawStaves,
  drawMeasure,
  renderNotes,
  connectStaves,
  renderMeasures,
  renderMusicStaff,
} from "../index";
import { Note, Measure } from "../../types";
import * as musicTheory from "../musicTheory";

const mockStave = {
  addClef: vi.fn().mockReturnThis(),
  addTimeSignature: vi.fn().mockReturnThis(),
  setContext: vi.fn().mockReturnThis(),
  draw: vi.fn(),
  getWidth: vi.fn(() => 200),
};

const mockContext = { someContext: true } as unknown as Vex.RenderContext;

vi.mock("vexflow", async () => {
  const actual = await vi.importActual<typeof Vex>("vexflow");
  return {
    ...actual,
    Stave: vi.fn(() => ({ ...mockStave })),
    StaveConnector: Object.assign(
      vi.fn().mockImplementation(() => ({
        setType: vi.fn().mockReturnThis(),
        setContext: vi.fn().mockReturnThis(),
        draw: vi.fn(),
      })),
      {
        typeString: {
          single: 1,
          double: 2,
          bracket: 3,
          brace: 4,
        },
      }
    ),
    Voice: vi.fn().mockImplementation(() => ({
      addTickables: vi.fn(),
      draw: vi.fn(),
    })),
    Formatter: vi.fn().mockImplementation(() => ({
      joinVoices: vi.fn().mockReturnThis(),
      format: vi.fn(),
    })),
  };
});

vi.mock("../musicTheory", async () => {
  const actual = await vi.importActual<typeof musicTheory>("../musicTheory");
  return {
    ...actual,
    createVexFlowNote: vi.fn((note) => ({ note })),
    organizeNotesIntoMeasures: vi.fn((notes) => [{ notes }]),
  };
});

describe("drawStaves", () => {
  it("draws treble and bass staves with clefs and time signatures", () => {
    const options = {
      width: 500,
      trebleClef: "treble",
      bassClef: "bass",
      timeSignature: "4/4",
      staffDistance: 100,
    };
    const { trebleStave, bassStave } = drawStaves(mockContext, options);
    expect(trebleStave.addClef).toHaveBeenCalledWith("treble");
    expect(trebleStave.addTimeSignature).toHaveBeenCalledWith("4/4");
    expect(trebleStave.draw).toHaveBeenCalled();

    expect(bassStave.addClef).toHaveBeenCalledWith("bass");
    expect(bassStave.addTimeSignature).toHaveBeenCalledWith("4/4");
    expect(bassStave.draw).toHaveBeenCalled();
  });
});

describe("drawMeasure", () => {
  it("draws first measure with clef and time signature", () => {
    drawMeasure(mockContext, {
      x: 10,
      y: 20,
      width: 300,
      isFirstMeasure: true,
    });
    expect(mockStave.addClef).toHaveBeenCalled();
    expect(mockStave.addTimeSignature).toHaveBeenCalled();
    expect(mockStave.draw).toHaveBeenCalled();
  });

  it("draws non-first measure without clef and time signature", () => {
    vi.clearAllMocks();
    drawMeasure(mockContext, {
      x: 10,
      y: 20,
      width: 300,
      isFirstMeasure: false,
    });
    expect(mockStave.addClef).not.toHaveBeenCalled();
    expect(mockStave.draw).toHaveBeenCalled();
  });
});

describe("renderNotes", () => {
  it("does nothing for empty notes", () => {
    renderNotes(mockContext, mockStave as unknown as Vex.Stave, []);
    expect(musicTheory.createVexFlowNote).not.toHaveBeenCalled();
  });

  it("formats and draws notes for a measure", () => {
    const notes: Note[] = [{ pitch: "C4", duration: "q" }];
    renderNotes(mockContext, mockStave as unknown as Vex.Stave, notes);
    expect(musicTheory.createVexFlowNote).toHaveBeenCalledWith(
      notes[0],
      "treble"
    );
  });
});

describe("renderMeasures", () => {
  it("draws a sequence of measures", () => {
    vi.clearAllMocks();
    const measures: Measure[] = [
      { notes: [{ pitch: "C4", duration: "q" }] },
      { notes: [{ pitch: "D4", duration: "q" }] },
    ];
    renderMeasures(mockContext, measures, {
      startX: 0,
      y: 10,
      width: 500,
    });
    expect(mockStave.draw).toHaveBeenCalled();
    expect(musicTheory.createVexFlowNote).toHaveBeenCalledTimes(2);
  });
});

describe("connectStaves", () => {
  it("connects staves with stave connectors", () => {
    connectStaves(mockContext, {
      startX: 0,
      trebleY: 10,
      bassY: 100,
      width: 500,
      measureCount: 4,
    });

    // expect multiple stave connectors to be created and drawn
    expect(Vex.StaveConnector).toHaveBeenCalled();
  });
});

describe("renderMusicStaff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("draws default staves when no notes are present", () => {
    // (musicTheory.organizeNotesIntoMeasures as any).mockReturnValueOnce([]);

    renderMusicStaff(mockContext, {
      width: 600,
      cantusFirmusNotes: [],
      counterpointNotes: [],
    });

    expect(mockStave.draw).toHaveBeenCalled();
  });

  it("renders measures when cantus firmus notes exist", () => {
    const note: Note = { pitch: "C4", duration: "q" };
    // (musicTheory.organizeNotesIntoMeasures as any).mockImplementation(
    //   (notes: Note[]) => [{ notes }]
    // );

    renderMusicStaff(mockContext, {
      width: 600,
      cantusFirmusNotes: [note],
      counterpointNotes: [note],
    });

    expect(mockStave.draw).toHaveBeenCalled();
    expect(musicTheory.createVexFlowNote).toHaveBeenCalled();
  });
});
