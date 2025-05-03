import { Box, Paper, Typography } from "@mui/material";
import { useCounterpoint } from "../hooks";
import MusicStaff from "./MusicStaff";

function StaffContainer() {
  const { cantusFirmus, counterpoint, selectedSpecies, isCounterpointAbove } =
    useCounterpoint();

  // const hasNotes = cantusFirmus.length > 0 || counterpoint.length > 0;
  const hasNotes = true;

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
        }}
      >
        {hasNotes ? (
          <MusicStaff />
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
