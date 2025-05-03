import { Stave, RenderContext } from "vexflow";

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

  const treble = new Stave(horizontalPadding, topMargin, staveWidth);
  treble.addClef(trebleClef).addTimeSignature(timeSignature);
  treble.setContext(context).draw();

  const bass = new Stave(horizontalPadding, bassStaveY, staveWidth);
  bass.addClef(bassClef).addTimeSignature(timeSignature);
  bass.setContext(context).draw();
}
