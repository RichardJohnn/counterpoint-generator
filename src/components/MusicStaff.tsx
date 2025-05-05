import { Box } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useVexFlowContext } from "../hooks";
import { renderMusicStaff } from "../utils";
import { Note } from "../types";

interface MusicStaffProps {
  cantusFirmusNotes?: Note[];
  counterpointNotes?: Note[];
  trebleClef?: string;
  bassClef?: string;
  timeSignature?: string;
  staffDistance?: number;
  isCounterpointAbove?: boolean;
}

function MusicStaff({
  cantusFirmusNotes = [],
  counterpointNotes = [],
  trebleClef = "treble",
  bassClef = "treble",
  timeSignature = "C",
  staffDistance = 150,
  isCounterpointAbove = true
}: MusicStaffProps) {
  const { containerRef, initialize, getContext } = useVexFlowContext();

  const renderStaves = useCallback(() => {
    if (!containerRef.current) return;

    initialize(containerRef.current);
    const context = getContext();
    if (context) {
      renderMusicStaff(context, {
        width: containerRef.current.clientWidth,
        // height: containerRef.current.clientHeight,
        cantusFirmusNotes,
        counterpointNotes,
        trebleClef,
        bassClef,
        timeSignature,
        staffDistance,
        isCounterpointAbove
      })
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
    staffDistance,
    isCounterpointAbove
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

  return <Box ref={containerRef} sx={{ width: "100%", height: "100%" }}></Box>;
}

export default MusicStaff;
