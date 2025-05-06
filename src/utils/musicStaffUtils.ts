import {
  Stave,
  RenderContext,
  Voice,
  Formatter,
  StaveConnector,
} from "vexflow";
import { Measure, Note } from "../types";
import { createVexFlowNote, organizeNotesIntoMeasures } from "./musicTheory";

const LAYOUT = {
  HORIZONTAL_PADDING: 10,
  TOP_MARGIN: 20,
  CLEF_TIME_SIGNATURE_WIDTH: 50,
  DEFAULT_STAFF_DISTANCE: 150,
  DEFAULT_MEASURE_COUNT: 8,
  STAVE_CONNECTOR_WIDTH: 1,
};

const DEFAULTS = {
  TREBLE_CLEF: "treble",
  BASS_CLEF: "treble",
  TIME_SIGNATURE: "C",
};

export interface MusicStaffOptions {
  width: number;
  height: number;
  cantusFirmusNotes: Note[];
  counterpointNotes: Note[];
  trebleClef?: string;
  bassClef?: string;
  timeSignature?: string;
  isCounterpointAbove?: boolean;
}

export interface MeasureOptions {
  x: number;
  y: number;
  width: number;
  clef?: string;
  timeSignature?: string;
  isFirstMeasure?: boolean;
}

export interface StaveConnectorOptions {
  startX: number;
  trebleY: number;
  bassY: number;
  width: number;
  measureCount: number;
}

export interface MeasuresRenderOptions {
  startX: number;
  y: number;
  width: number;
  clef?: string;
  timeSignature?: string;
}

export function drawMeasure(context: RenderContext, options: MeasureOptions) {
  const {
    x,
    y,
    width,
    clef = DEFAULTS.TREBLE_CLEF,
    timeSignature = DEFAULTS.TIME_SIGNATURE,
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
  clef = DEFAULTS.TREBLE_CLEF
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
  options: MeasuresRenderOptions
) {
  const {
    startX,
    y,
    width,
    clef = DEFAULTS.TREBLE_CLEF,
    timeSignature = DEFAULTS.TIME_SIGNATURE,
  } = options;

  const measureWidth =
    measures.length > 1
      ? (width - LAYOUT.CLEF_TIME_SIGNATURE_WIDTH) / measures.length
      : width - LAYOUT.CLEF_TIME_SIGNATURE_WIDTH;

  measures.forEach((measure, index) => {
    let measureX: number, currentMeasureWidth: number;

    if (index === 0) {
      measureX = startX;
      currentMeasureWidth = measureWidth + LAYOUT.CLEF_TIME_SIGNATURE_WIDTH;
    } else {
      measureX =
        startX + LAYOUT.CLEF_TIME_SIGNATURE_WIDTH + index * measureWidth;
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

export function connectStaves(
  context: RenderContext,
  options: StaveConnectorOptions
) {
  const { startX, trebleY, bassY, width, measureCount } = options;

  const measureWidth =
    measureCount > 1
      ? (width - LAYOUT.CLEF_TIME_SIGNATURE_WIDTH) / measureCount
      : width - LAYOUT.CLEF_TIME_SIGNATURE_WIDTH;

  const trebleStartStave = new Stave(
    startX,
    trebleY,
    LAYOUT.STAVE_CONNECTOR_WIDTH
  );
  const bassStartStave = new Stave(startX, bassY, LAYOUT.STAVE_CONNECTOR_WIDTH);

  new StaveConnector(trebleStartStave, bassStartStave)
    .setType(StaveConnector.typeString.bracket)
    .setContext(context)
    .draw();

  new StaveConnector(trebleStartStave, bassStartStave)
    .setType(StaveConnector.typeString.singleLeft)
    .setContext(context)
    .draw();

  const endX = startX + width;
  const trebleEndStave = new Stave(
    endX - LAYOUT.STAVE_CONNECTOR_WIDTH,
    trebleY,
    LAYOUT.STAVE_CONNECTOR_WIDTH
  );
  const bassEndStave = new Stave(
    endX - LAYOUT.STAVE_CONNECTOR_WIDTH,
    bassY,
    LAYOUT.STAVE_CONNECTOR_WIDTH
  );

  new StaveConnector(trebleEndStave, bassEndStave)
    .setType(StaveConnector.typeString.boldDoubleRight)
    .setContext(context)
    .draw();

  for (let i = 1; i < measureCount; i++) {
    let x;
    if (i === 1) {
      x = startX + LAYOUT.CLEF_TIME_SIGNATURE_WIDTH + measureWidth;
    } else {
      x = startX + LAYOUT.CLEF_TIME_SIGNATURE_WIDTH + i * measureWidth;
    }

    const trebleMeasureStave = new Stave(
      x,
      trebleY,
      LAYOUT.STAVE_CONNECTOR_WIDTH
    );
    const bassMeasureStave = new Stave(x, bassY, LAYOUT.STAVE_CONNECTOR_WIDTH);

    new StaveConnector(trebleMeasureStave, bassMeasureStave)
      .setType(StaveConnector.typeString.single)
      .setContext(context)
      .draw();
  }
}

export function renderMusicStaff(
  context: RenderContext,
  options: MusicStaffOptions
) {
  const {
    width,
    height,
    cantusFirmusNotes,
    counterpointNotes,
    trebleClef = DEFAULTS.TREBLE_CLEF,
    bassClef = DEFAULTS.BASS_CLEF,
    timeSignature = DEFAULTS.TIME_SIGNATURE,
    isCounterpointAbove = true,
  } = options;

  const cantusFirmusMeasures = organizeNotesIntoMeasures(
    cantusFirmusNotes,
    timeSignature
  );
  const counterpointMeasures = organizeNotesIntoMeasures(
    counterpointNotes,
    timeSignature
  );

  const startX = LAYOUT.HORIZONTAL_PADDING;
  const trebleY = LAYOUT.TOP_MARGIN;
  const bassY = height / 2;
  const availableWidth = width - LAYOUT.HORIZONTAL_PADDING * 2;

  if (cantusFirmusMeasures.length === 0) {
    // drawStaves(context, {
    //   width,
    //   height,
    //   trebleClef,
    //   bassClef,
    //   timeSignature,
    //   staffDistance,
    // });
    renderMeasures(context, [{notes:[]}], {
      startX,
      y: trebleY,
      width: availableWidth,
      clef: trebleClef,
      timeSignature,
    });

    renderMeasures(context, [{notes:[]}], {
      startX,
      y: bassY,
      width: availableWidth,
      clef: bassClef,
      timeSignature,
    });

    connectStaves(context, {
      startX,
      trebleY,
      bassY: bassY,
      width: availableWidth,
      measureCount: LAYOUT.DEFAULT_MEASURE_COUNT,
    });
  } else {
    const emptyMeasures = cantusFirmusMeasures.map(() => ({ notes: [] }));
    const counterpointLine =
      counterpointMeasures.length === 0 ? emptyMeasures : counterpointMeasures;

    if (isCounterpointAbove) {
      renderMeasures(context, counterpointLine, {
        startX,
        y: trebleY,
        width: availableWidth,
        clef: trebleClef,
        timeSignature,
      });

      renderMeasures(context, cantusFirmusMeasures, {
        startX,
        y: bassY,
        width: availableWidth,
        clef: bassClef,
        timeSignature,
      });
    } else {
      renderMeasures(context, cantusFirmusMeasures, {
        startX,
        y: trebleY,
        width: availableWidth,
        clef: trebleClef,
        timeSignature,
      });

      renderMeasures(context, counterpointLine, {
        startX,
        y: bassY,
        width: availableWidth,
        clef: bassClef,
        timeSignature,
      });
    }

    connectStaves(context, {
      startX,
      trebleY,
      bassY,
      width: availableWidth,
      measureCount: cantusFirmusMeasures.length,
    });
  }
}
