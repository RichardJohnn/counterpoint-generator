import { Box } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useVexFlowContext } from "../hooks";
import { renderMusicStaff } from "../utils";
import { Note } from "../types";
import { useStaffInteraction, useCounterpoint } from "../hooks";

interface MusicStaffProps {
  cantusFirmusNotes?: Note[];
  counterpointNotes?: Note[];
  trebleClef?: string;
  bassClef?: string;
  timeSignature?: string;
  staffDistance?: number;
  isCounterpointAbove?: boolean;
  editMode?: "cantus" | "counterpoint";
}

function MusicStaff({
  cantusFirmusNotes = [],
  counterpointNotes = [],
  trebleClef = "treble",
  bassClef = "treble",
  timeSignature = "C",
  isCounterpointAbove = true,
  editMode = "cantus",
}: MusicStaffProps) {
  const { containerRef, initialize, getContext } = useVexFlowContext();

  const {
    setCantusFirmus,
    setCounterpoint,
    cantusFirmus,
    counterpoint,
  } = useCounterpoint();

  const handleAddNote = useCallback(
    (note: Note) => {
      if (editMode === "cantus") {
        setCantusFirmus([...cantusFirmus, note]);
      } else {
        setCounterpoint([...counterpoint, note]);
      }
    },
    [editMode, cantusFirmus, counterpoint, setCantusFirmus, setCounterpoint]
  );

  const {
    hoveredPitch,
    showGhostNote,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
  } = useStaffInteraction({
    staffRef: containerRef,
    trebleClef,
    bassClef,
    isCounterpointAbove,
    onAddNote: handleAddNote,
    staffLineHeight: 10,
  });

  const renderStaves = useCallback(() => {
    if (!containerRef.current) return;

    initialize(containerRef.current);
    const context = getContext();
    if (context) {
      let ghostNote: Note | null = null;
      if (showGhostNote && hoveredPitch) {
        ghostNote = {
          pitch: hoveredPitch,
          duration: "w",
        }
      }

      const isGhostNoteAbove = editMode === "counterpoint" ? isCounterpointAbove : !isCounterpointAbove;

      renderMusicStaff(context, {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        cantusFirmusNotes,
        counterpointNotes,
        trebleClef,
        bassClef,
        timeSignature,
        isCounterpointAbove,
        ghostNote,
        isGhostNoteAbove
      });
    }
  }, [
    containerRef,
    initialize,
    getContext,
    cantusFirmusNotes,
    counterpointNotes,
    trebleClef,
    bassClef,
    timeSignature,
    isCounterpointAbove,
    showGhostNote,
    hoveredPitch,
    editMode,
  ]);

  useEffect(() => {
    renderStaves();

    function handleResize() {
      renderStaves();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [renderStaves]);

  return (
    <Box
      ref={containerRef}
      sx={{ width: "100%", height: "100%" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    />
  );
}

export default MusicStaff;
