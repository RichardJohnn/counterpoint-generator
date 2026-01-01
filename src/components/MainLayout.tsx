import { ReactNode } from "react";
import { Box, Container, Paper } from "@mui/material";

interface MainLayoutProps {
  header: ReactNode;
  inputControls: ReactNode;
  staffContainer: ReactNode;
  generationControls: ReactNode;
  playbackControls: ReactNode;
  statusBar: ReactNode;
  analysisLog?: ReactNode;
}

function MainLayout({
  header,
  inputControls,
  staffContainer,
  generationControls,
  playbackControls,
  statusBar,
  analysisLog,
}: MainLayoutProps) {
  return (
    <Container
      maxWidth="lg"
      sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", pb: 2 }}
    >
      <Box component="header" sx={{ py: 2 }}>
        {header}
      </Box>

      {/* Input controls - above staff */}
      <Paper elevation={2} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
        {inputControls}
      </Paper>

      {/* Musical staff */}
      <Paper
        elevation={3}
        sx={{ mb: 2, p: 2, minHeight: 400, borderRadius: 2, overflow: "auto" }}
      >
        {staffContainer}
      </Paper>

      {/* Generation controls - species, rules, generate */}
      <Paper elevation={2} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
        {generationControls}
      </Paper>

      {/* Playback controls */}
      <Paper elevation={2} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
        {playbackControls}
      </Paper>

      {/* Status bar */}
      <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2 }}>
        {statusBar}
      </Paper>

      {/* Analysis log */}
      {analysisLog}
    </Container>
  );
}

export default MainLayout;
