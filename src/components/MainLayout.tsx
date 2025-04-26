import { ReactNode } from "react";
import { Box, Container, Paper } from "@mui/material";

interface MainLayoutProps {
  header: ReactNode;
  controlPanel: ReactNode;
  staffContainer: ReactNode;
  statusBar: ReactNode;
}

function MainLayout({
  header,
  controlPanel,
  staffContainer,
  statusBar,
}: MainLayoutProps) {
  return (
    <Container
      maxWidth="lg"
      sx={{ height: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Box component="header" sx={{ py: 2 }}>
        {header}
      </Box>
      <Paper elevation={3} sx={{ mb: 2, p: 2, borderRadius: 2 }}>
        {controlPanel}
      </Paper>
      <Paper
        elevation={3}
        sx={{ flex: 1, mb: 2, p: 2, overflow: "auto", borderRadius: 2 }}
      >
        {staffContainer}
      </Paper>
      <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2 }}>
        {statusBar}
      </Paper>
    </Container>
  );
}

export default MainLayout;
