import { Box } from "@mui/material";
import { useCallback, useEffect } from "react";
import { useVexFlowContext } from "../hooks";
import { drawStaves } from "../utils";

interface MusicStaffProps {
  trebleClef?: string;
  bassClef?: string;
  timeSignature?: string;
  staffDistance?: number;
}

function MusicStaff({
  trebleClef = "treble",
  bassClef = "bass",
  timeSignature = "C",
  staffDistance = 150,
}: MusicStaffProps) {
  const { containerRef, initialize, getContext } = useVexFlowContext();

  const renderStaves = useCallback(() => {
    if (!containerRef.current) return;

    initialize(containerRef.current);
    const context = getContext();
    if (context) {
      drawStaves(context, {
        width: containerRef.current.clientWidth,
        trebleClef,
        bassClef,
        timeSignature,
        staffDistance,
      });
    }
  }, [
    containerRef,
    initialize,
    getContext,
    trebleClef,
    bassClef,
    timeSignature,
    staffDistance,
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
