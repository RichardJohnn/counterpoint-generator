import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useCounterpoint } from "../hooks";
import { useEffect, useRef, useState } from "react";
import MusicStaff from "./MusicStaff";

function StaffContainer() {
  const { cantusFirmus, counterpoint, selectedSpecies, isCounterpointAbove } =
    useCounterpoint();
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const containerRef = useRef<HTMLDivElement>(null);
  const [staffWidth, setStaffWidth] = useState(800);

  // const hasNotes = cantusFirmus.length > 0 || counterpoint.length > 0;
  const hasNotes = true;

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth - 40;
        setStaffWidth(Math.max(newWidth, 300));
      }
    }

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [])

  const upperClef = isCounterpointAbove ? "treble" : "bass";
  const lowerClef = isCounterpointAbove ? "bass" : "treble";

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" gutterBottom>
        Counterpoint Score Species {selectedSpecies}
      </Typography>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          bgcolor: "#fcfcfc",
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          overflow: "auto",
        }}
      >
        {hasNotes ? (
          <>
            <Box
              sx={{
                width: "100%",
                height: "40%",
                // border: "1px dashed #ccc",
                // mb: 2,
                display: "flex",
                // justifyContent: "center",
                // alignItems: "center",
                flexDirection: "column",
                mb: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {isCounterpointAbove ? "Counterpoint Line" : "Cantus Firmus"} (
                {isCounterpointAbove
                  ? counterpoint.length
                  : cantusFirmus.length}{" "}
                notes)
              </Typography>
              <Box sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1,
                bgcolor: "#fff",
                height: isMobile ? 120 : 150
              }}>
                <MusicStaff
                  clef={upperClef}
                  width={staffWidth}
                  height={isMobile ? 100 : 130}
                  measures={Math.max(4, Math.ceil((isCounterpointAbove ? counterpoint.length : cantusFirmus.length) / 4))}
                />
              </Box>
            </Box>

            <Box
              sx={{
                width: "100%",
                // height: "40%",
                // border: "1px dashed #ccc",
                display: "flex",
                // justifyContent: "center",
                // alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {isCounterpointAbove ? "Cantus Firmus" : "Counterpoint Line"} (
                {isCounterpointAbove
                  ? cantusFirmus.length
                  : counterpoint.length}{" "}
                notes)
              </Typography>
              <Box sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1,
                bgcolor: "#fff",
                height: isMobile ? 120 : 150,
              }}>
                <MusicStaff
                  clef={lowerClef}
                  width={staffWidth}
                  height={isMobile ? 100 : 130}
                  measures={Math.max(4, Math.ceil((isCounterpointAbove ? cantusFirmus.length : counterpoint.length) / 4))}
                />
              </Box>
            </Box>
          </>
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            No notes yet. Musical staff will be rendered here.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default StaffContainer;
