import { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import MainLayout from "./components/MainLayout";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import StaffContainer from "./components/StaffContainer";
import StatusBar from "./components/StatusBar";
import { CounterpointProvider } from "./context/CounterpointContext";

function App() {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("info");

  const handlePlay = () => {
    setStatusMessage("Playing counterpoint...");
    setStatusSeverity("success");
  };

  const handleStop = () => {
    setStatusMessage("Playback stopped");
    setStatusSeverity("info");
  };

  const handleReset = () => {
    setStatusMessage("Counterpoint reset");
    setStatusSeverity("warning");
  };

  const clearStatus = () => {
    setStatusMessage("");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CounterpointProvider>
        <MainLayout
          header={<Header />}
          controlPanel={
            <ControlPanel
              onPlay={handlePlay}
              onStop={handleStop}
              onReset={handleReset}
            />
          }
          staffContainer={<StaffContainer />}
          statusBar={
            <StatusBar
              message={statusMessage}
              severity={statusSeverity}
              onClear={clearStatus}
            />
          }
        />
      </CounterpointProvider>
    </ThemeProvider>
  );
}

export default App;
