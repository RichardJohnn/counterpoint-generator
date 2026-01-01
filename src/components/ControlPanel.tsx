import { useRef, useState } from "react";
import { useCounterpoint, usePlayback } from "../hooks";
import { Species, RuleConfig, DEFAULT_RULES, GenerationAnalysis } from "../types";
import { parseMidiFile, generateFirstSpecies, downloadMidi } from "../utils";
import RulesConfig from "./RulesConfig";
import PlayIcon from "@mui/icons-material/PlayArrow"
import StopIcon from "@mui/icons-material/Stop"
import RestartIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo"
import UploadIcon from "@mui/icons-material/UploadFile"
import DownloadIcon from "@mui/icons-material/Download"
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh"
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
  Typography,
} from "@mui/material";

interface ControlPanelProps {
  onPlay?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  onMidiImportSuccess?: (noteCount: number) => void;
  onMidiImportError?: (error: string) => void;
  onGenerate?: (analysis: GenerationAnalysis) => void;
  onGenerateError?: (error: string) => void;
}

function ControlPanel({ onPlay, onStop, onReset, onMidiImportSuccess, onMidiImportError, onGenerate, onGenerateError }: ControlPanelProps) {
  const {
    cantusFirmus,
    counterpoint,
    selectedSpecies,
    isCounterpointAbove,
    setSpecies,
    setPosition,
    setCantusFirmus,
    setCounterpoint,
    undo,
    history,
  } = useCounterpoint();

  const { isPlaying, play, stop, setTempo: setPlaybackTempo } = usePlayback();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempo, setTempo] = useState(60);
  const [rules, setRules] = useState<RuleConfig[]>(DEFAULT_RULES);

  function handleSpeciesChange(event: SelectChangeEvent) {
    const newSpecies = parseInt(event.target.value) as Species;
    setSpecies(newSpecies);
  }

  function handlePlayToggle() {
    if (isPlaying) {
      stop();
      onStop?.();
    } else {
      play(cantusFirmus, counterpoint, tempo);
      onPlay?.();
    }
  }

  function handleTempoChange(_event: Event, value: number | number[]) {
    const newTempo = value as number;
    setTempo(newTempo);
    setPlaybackTempo(newTempo);
  }

  function handleReset() {
    stop();
    onReset?.();
  }

  function handleChangePosition(event: React.ChangeEvent<HTMLInputElement>) {
    const isAbove = event.target.checked;
    setPosition(isAbove);
  }

  function handleUndo() {
    undo();
  }

  async function handleMidiFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await parseMidiFile(file);

    if (result.errors.length > 0) {
      onMidiImportError?.(result.errors[0]);
    } else if (result.notes.length > 0) {
      setCantusFirmus(result.notes);
      onMidiImportSuccess?.(result.notes.length);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleGenerate() {
    if (cantusFirmus.length === 0) {
      onGenerateError?.("Please enter a cantus firmus first");
      return;
    }

    const result = generateFirstSpecies(cantusFirmus, isCounterpointAbove, rules);

    if (result.success) {
      setCounterpoint(result.notes);
      onGenerate?.(result.analysis);
    } else {
      onGenerateError?.(result.error || "Failed to generate counterpoint");
    }
  }

  function handleExport() {
    downloadMidi(cantusFirmus, counterpoint, "counterpoint.mid", tempo);
  }

  const canUndo = history.length > 0;
  const canExport = cantusFirmus.length > 0 || counterpoint.length > 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Controls
      </Typography>
      <Grid container spacing={3} alignItems="center">
        <Grid size={{ xs: 12, sm: 4}}>
          <FormControl fullWidth>
            <InputLabel id="species-select-label">Species</InputLabel>
            <Select
              labelId="species-select-label"
              id="species-select"
              value={selectedSpecies.toString()}
              label="Species"
              onChange={handleSpeciesChange}
            >
              <MenuItem value={1}>1st Species</MenuItem>
              <MenuItem value={2}>2nd Species</MenuItem>
              <MenuItem value={3}>3rd Species</MenuItem>
              <MenuItem value={4}>4th Species</MenuItem>
              <MenuItem value={5}>5th Species</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 4}}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color={isPlaying ? "error" : "primary"}
              startIcon={isPlaying ? <StopIcon /> : <PlayIcon />}
              onClick={handlePlayToggle}
              fullWidth
            >
              {isPlaying ? "Stop" : "Play"}
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RestartIcon />}
              onClick={handleReset}
              fullWidth
            >
              Reset
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleMidiFileChange}
              accept=".mid,.midi"
              style={{ display: "none" }}
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={handleImportClick}
              fullWidth
            >
              Import MIDI
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<AutoFixHighIcon />}
              onClick={handleGenerate}
              fullWidth
              disabled={cantusFirmus.length === 0}
            >
              Generate
            </Button>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              fullWidth
              disabled={!canExport}
            >
              Export MIDI
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4}}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isCounterpointAbove}
                  onChange={handleChangePosition}
                  color="primary"
                />
              }
              label={`Counterpoint ${isCounterpointAbove ? "Above": "Below"}`}
            />

            <Button
              variant="outlined"
              color="primary"
              startIcon={<UndoIcon />}
              onClick={handleUndo}
              disabled={!canUndo}
              sx={{ ml: 2 }}
            >
              Undo
            </Button>

            <Box sx={{ width: 150, ml: 3 }}>
              <Typography variant="body2" gutterBottom>
                Tempo: {tempo} BPM
              </Typography>
              <Slider
                value={tempo}
                onChange={handleTempoChange}
                min={40}
                max={120}
                valueLabelDisplay="auto"
                size="small"
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      <RulesConfig rules={rules} onChange={setRules} />
    </Box>
  );
}

export default ControlPanel;
