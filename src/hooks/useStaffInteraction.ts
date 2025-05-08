import { useCallback, useState } from "react";
import { Note } from "../types";
import { LAYOUT } from "../utils";

interface StaffInteractionState {
  hoveredPosition: { x: number; y: number } | null;
  hoveredPitch: string | null;
  showGhostNote: boolean;
}

interface UseStaffInteractionProps {
  staffRef: React.RefObject<HTMLDivElement | null>;
  trebleClef?: string;
  bassClef?: string;
  isCounterpointAbove: boolean;
  onAddNote?: (note: Note) => void;
  staffLineHeight?: number;
}

interface UseStaffInteractionResult extends StaffInteractionState {
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  handleClick: (e: React.MouseEvent) => void;
  calculatePitchFromYPosition: (y: number) => string | null;
}

interface ClefReference {
  middleLineNote: string;
  middleLineOctave: number;
}

const CLEF_REFERENCES: Record<string, ClefReference> = {
  treble: { middleLineNote: "B", middleLineOctave: 4 },
  alto: { middleLineNote: "C", middleLineOctave: 4 },
  tenor: { middleLineNote: "A", middleLineOctave: 3 },
  bass: { middleLineNote: "D", middleLineOctave: 3 },
};

export function useStaffInteraction({
  staffRef,
  trebleClef,
  bassClef,
  isCounterpointAbove,
  onAddNote,
  staffLineHeight = 10,
}: UseStaffInteractionProps): UseStaffInteractionResult {
  const [state, setState] = useState<StaffInteractionState>({
    hoveredPosition: null,
    hoveredPitch: null,
    showGhostNote: false,
  });

  const calculatePitchFromYPosition = useCallback(
    (y: number): string | null => {
      if (!staffRef.current) return null;

      const staffRect = staffRef.current.getBoundingClientRect();
      const relativeY = y - staffRect.top;
      const height = staffRect.height;

      // FIXME: These measurements seem a bit hacky but they work
      const trebleY = LAYOUT.TOP_MARGIN + staffLineHeight * 4;
      const bassY = height / 2 + staffLineHeight * 4;
      const staffHeight = (height - LAYOUT.TOP_MARGIN * 2) / 2;

      let activeClef: string;
      let staffTop: number;

      if (relativeY < bassY - staffHeight / 2) {
        if (isCounterpointAbove) return null;
        activeClef = trebleClef || "treble";
        staffTop = trebleY;
      } else {
        if (!isCounterpointAbove) return null;
        activeClef = bassClef || "treble";
        staffTop = bassY;
      }

      const middleLineY = staffTop + 2 * staffLineHeight;
      const stepsFromMiddle = Math.round(
        (middleLineY - relativeY) / (staffLineHeight / 2)
      );

      const { middleLineNote, middleLineOctave } = CLEF_REFERENCES[activeClef];

      const pitchNames = ["C", "D", "E", "F", "G", "A", "B"];
      let noteIndex = pitchNames.indexOf(middleLineNote);
      let octave = middleLineOctave;

      noteIndex += stepsFromMiddle;

      while (noteIndex < 0) {
        noteIndex += 7;
        octave -= 1;
      }

      while (noteIndex >= 7) {
        noteIndex -= 7;
        octave += 1;
      }

      return `${pitchNames[noteIndex]}${octave}`;
    },
    [staffRef, staffLineHeight, trebleClef, bassClef, isCounterpointAbove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!staffRef.current) return;

      const x = e.clientX;
      const y = e.clientY;

      const pitch = calculatePitchFromYPosition(y);

      setState({
        hoveredPosition: { x, y },
        hoveredPitch: pitch,
        showGhostNote: Boolean(pitch),
      });
    },
    [staffRef, calculatePitchFromYPosition]
  );

  const handleMouseLeave = useCallback(() => {
    setState({
      hoveredPosition: null,
      hoveredPitch: null,
      showGhostNote: false,
    });
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!staffRef.current || !onAddNote) return;

      const pitch = calculatePitchFromYPosition(e.clientY);

      if (pitch) {
        const newNote: Note = {
          pitch,
          duration: "w",
        };

        onAddNote(newNote);
      }
    },
    [staffRef, calculatePitchFromYPosition, onAddNote]
  );

  return {
    ...state,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    calculatePitchFromYPosition,
  };
}
