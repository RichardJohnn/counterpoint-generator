import { useState } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import MainLayout from "./components/MainLayout";
import Header from "./components/Header";
import InputControls from "./components/InputControls";
import StaffContainer from "./components/StaffContainer";
import GenerationControls from "./components/GenerationControls";
import PlaybackControls from "./components/PlaybackControls";
import StatusBar from "./components/StatusBar";
import AnalysisLog from "./components/AnalysisLog";
import { CounterpointProvider } from "./context";
import { GenerationAnalysis } from "./types";

function App() {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("info");
  const [analysis, setAnalysis] = useState<GenerationAnalysis | null>(null);
  const [tempo, setTempo] = useState(60);

  const handlePlay = () => {
    setStatusMessage("Playing...");
    setStatusSeverity("success");
  };

  const handleStop = () => {
    setStatusMessage("Playback stopped");
    setStatusSeverity("info");
  };

  const handleReset = () => {
    setStatusMessage("Reset");
    setStatusSeverity("warning");
    setAnalysis(null);
  };

  const handleMidiImportSuccess = (noteCount: number) => {
    setStatusMessage(
      `Imported ${noteCount} note${noteCount === 1 ? "" : "s"} from MIDI file`
    );
    setStatusSeverity("success");
  };

  const handleCFGenerated = (noteCount: number) => {
    setStatusMessage(
      `Generated cantus firmus with ${noteCount} note${noteCount === 1 ? "" : "s"}`
    );
    setStatusSeverity("success");
  };

  const handleMidiImportError = (error: string) => {
    setStatusMessage(error);
    setStatusSeverity("error");
  };

  const handleGenerate = (generationAnalysis: GenerationAnalysis) => {
    setAnalysis(generationAnalysis);
    setStatusMessage(`Counterpoint generated - ${generationAnalysis.summary}`);
    setStatusSeverity("success");
  };

  const handleGenerateError = (error: string) => {
    setStatusMessage(error);
    setStatusSeverity("error");
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
          inputControls={
            <InputControls
              onReset={handleReset}
              onMidiImportSuccess={handleMidiImportSuccess}
              onMidiImportError={handleMidiImportError}
              onCFGenerated={handleCFGenerated}
              tempo={tempo}
            />
          }
          staffContainer={<StaffContainer />}
          generationControls={
            <GenerationControls
              onGenerate={handleGenerate}
              onGenerateError={handleGenerateError}
            />
          }
          playbackControls={
            <PlaybackControls
              tempo={tempo}
              onTempoChange={setTempo}
              onPlay={handlePlay}
              onStop={handleStop}
            />
          }
          statusBar={
            <StatusBar
              message={statusMessage}
              severity={statusSeverity}
              onClear={clearStatus}
            />
          }
          analysisLog={<AnalysisLog analysis={analysis} />}
        />
      </CounterpointProvider>
    </ThemeProvider>
  );
}

export default App;
