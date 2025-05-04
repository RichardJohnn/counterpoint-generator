import { Stave, RenderContext, Voice, Formatter } from "vexflow";
import { Measure, Note } from "../types";
import { createVexFlowNote, organizeNotesIntoMeasures } from "./musicTheory";

export interface StaveOptions {
  width: number;
  trebleClef: string;
  bassClef: string;
  timeSignature: string;
  staffDistance: number;
}

// TODO: add height to dynamically move bottom staff?
export function drawStaves(context: RenderContext, options: StaveOptions) {
  const { width, trebleClef, bassClef, timeSignature, staffDistance } = options;

  const horizontalPadding = 10;
  const staveWidth = width - horizontalPadding * 2;

  const topMargin = 20;

  const bassStaveY = topMargin + staffDistance;

  const trebleStave = new Stave(horizontalPadding, topMargin, staveWidth);
  trebleStave.addClef(trebleClef).addTimeSignature(timeSignature);
  trebleStave.setContext(context).draw();

  const bassStave = new Stave(horizontalPadding, bassStaveY, staveWidth);
  bassStave.addClef(bassClef).addTimeSignature(timeSignature);
  bassStave.setContext(context).draw();

  return { trebleStave, bassStave };
}

export function drawMeasure(
  context: RenderContext,
  options: {
    x: number;
    y: number;
    width: number;
    clef?: string;
    timeSignature?: string;
    isFirstMeasure?: boolean;
  }
) {
  const {
    x,
    y,
    width,
    clef = "treble",
    timeSignature = "C",
    isFirstMeasure = false,
  } = options;

  const stave = new Stave(x, y, width);

  if (isFirstMeasure) {
    stave.addClef(clef).addTimeSignature(timeSignature);
  }

  stave.setContext(context).draw();

  return stave;
}
export function renderNotes(
  context: RenderContext,
  stave: Stave,
  notes: Note[],
  clef="treble"
) {
  if (notes.length === 0) return;

  const vexNotes = notes.map((note) => createVexFlowNote(note, clef));

  const voice = new Voice({
    numBeats: 4,
    beatValue: 4,
  });

  voice.addTickables(vexNotes);

  const formatter = new Formatter();
  formatter.joinVoices([voice]).format([voice], stave.getWidth() - 50);

  voice.draw(context, stave);
}

export function renderMeasures(
  context: RenderContext,
  measures: Measure[],
  options: {
    startX: number;
    y: number;
    width: number;
    clef?: string;
    timeSignature?: string;
  }
) {
  const { startX, y, width, clef = "treble", timeSignature = "C" } = options;

  const clefAndTimeSignatureWidth = 60;
  const measureWidth = measures.length > 1 ? (width - clefAndTimeSignatureWidth) / measures.length : width - clefAndTimeSignatureWidth;

  measures.forEach((measure, index) => {
    let measureX, currentMeasureWidth;

    if (index === 0) {
      measureX = startX;
      currentMeasureWidth = measureWidth + clefAndTimeSignatureWidth;
    } else {
      measureX = startX + clefAndTimeSignatureWidth + index * measureWidth;
      currentMeasureWidth = measureWidth;
    }

    const stave = drawMeasure(context, {
      x: measureX,
      y,
      width: currentMeasureWidth,
      clef,
      timeSignature,
      isFirstMeasure: index === 0,
    });

    renderNotes(context, stave, measure.notes, clef);
  });
}

export function renderMusicStaff(
  context: RenderContext,
  options: {
    width: number;
    // height: number;
    notes: Note[];
    trebleClef?: string;
    bassClef?: string;
    timeSignature?: string;
    staffDistance?: number;
    isCounterpointAbove?: boolean;
  }
) {
  const {
    width,
    // height,
    notes,
    trebleClef = "treble",
    bassClef = "bass",
    timeSignature = "C",
    staffDistance = 150,
    isCounterpointAbove = true
  } = options;
  const measures = organizeNotesIntoMeasures(notes, timeSignature);

  if (measures.length === 0) {
    drawStaves(context, {
      width,
      trebleClef,
      bassClef,
      timeSignature,
      staffDistance,
    });
  } else {
    const emptyMeasures = measures.map(() => ({ notes: [] }));

    const startX = 10;
    const trebleY = 40;
    const bassY = trebleY + staffDistance;
    const availableWidth = width - 20;

    if (isCounterpointAbove) {
      renderMeasures(context, emptyMeasures, {
        startX,
        y: trebleY,
        width: availableWidth,
        clef: trebleClef,
        timeSignature
      });

      renderMeasures(context, measures, {
        startX,
        y: bassY,
        width: availableWidth,
        clef: bassClef,
        timeSignature
      });
    } else {
      renderMeasures(context, measures, {
        startX,
        y: trebleY,
        width: availableWidth,
        clef: trebleClef,
        timeSignature
      });

      renderMeasures(context, emptyMeasures, {
        startX,
        y: bassY,
        width: availableWidth,
        clef: bassClef,
        timeSignature
      });
    }
  }
}
