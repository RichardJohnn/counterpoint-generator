import { useCallback, useState } from "react";
import { Note } from "../types";

interface StaffInteractionState {
  hoveredPosition: { x: number; y: number } | null;
  hoveredPitch: string | null;
  showGhostNote: boolean;
}

interface UseStaffInteractionProps {
  staffRef: React.RefObject<HTMLDivElement>;
  onAddNote?: (note: Note) => void;
  staffLineHeight?: number;
}

interface UseStaffInteractionResult extends StaffInteractionState {
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  handleClick: (e: React.MouseEvent) => void;
  calculatePitchFromYPosition: (y: number) => string | null;
}

export function useStaffInteraction({
  staffRef,
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

      const middleLineY = staffRect.height / 2;
      const stepsFromMiddle = Math.round(
        (middleLineY - relativeY) / (staffLineHeight / 2)
      );

      const pitchNames = ["C", "D", "E", "F", "G", "A", "B"];

      let octave = 4;
      let noteIndex = 6;

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
    [staffRef, staffLineHeight]
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
