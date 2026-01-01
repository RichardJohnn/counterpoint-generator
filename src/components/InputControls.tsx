import { useRef } from "react";
import { useCounterpoint } from "../hooks";
import { parseMidiFile, downloadMidi, generateCantusFirmus } from "../utils";
import { Mode, Finalis, MODE_NAMES, FINALIS_OPTIONS } from "../types";
import UploadIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import RestartIcon from "@mui/icons-material/RestartAlt";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
} from "@mui/material";

interface InputControlsProps {
  onReset?: () => void;
  onMidiImportSuccess?: (noteCount: number) => void;
  onMidiImportError?: (error: string) => void;
  onCFGenerated?: (noteCount: number) => void;
  tempo: number;
}

function InputControls({
  onReset,
  onMidiImportSuccess,
  onMidiImportError,
  onCFGenerated,
  tempo,
}: InputControlsProps) {
  const {
    cantusFirmus,
    counterpoint,
    isCounterpointAbove,
    selectedMode,
    selectedFinalis,
    setCantusFirmus,
    setPosition,
    setMode,
    setFinalis,
  } = useCounterpoint();

  function handleGenerateCF() {
    const notes = generateCantusFirmus({
      mode: selectedMode,
      finalis: selectedFinalis,
    });
    setCantusFirmus(notes);
    onCFGenerated?.(notes.length);
  }

  function handleModeChange(event: SelectChangeEvent) {
    setMode(event.target.value as Mode);
  }

  function handleFinalisChange(event: SelectChangeEvent) {
    setFinalis(event.target.value as Finalis);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleMidiFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
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

  function handleExport() {
    downloadMidi(cantusFirmus, counterpoint, "counterpoint.mid", tempo);
  }

  function handleChangePosition(event: React.ChangeEvent<HTMLInputElement>) {
    setPosition(event.target.checked);
  }

  const canExport = cantusFirmus.length > 0 || counterpoint.length > 0;

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
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
      >
        Import MIDI
      </Button>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="mode-select-label">Mode</InputLabel>
        <Select
          labelId="mode-select-label"
          id="mode-select"
          value={selectedMode}
          label="Mode"
          onChange={handleModeChange}
        >
          {Object.entries(MODE_NAMES).map(([mode, name]) => (
            <MenuItem key={mode} value={mode}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 80 }}>
        <InputLabel id="finalis-select-label">Finalis</InputLabel>
        <Select
          labelId="finalis-select-label"
          id="finalis-select"
          value={selectedFinalis}
          label="Finalis"
          onChange={handleFinalisChange}
        >
          {FINALIS_OPTIONS.map((note) => (
            <MenuItem key={note} value={note}>
              {note}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        startIcon={<MusicNoteIcon />}
        onClick={handleGenerateCF}
      >
        Generate CF
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        startIcon={<RestartIcon />}
        onClick={onReset}
      >
        Reset
      </Button>

      <Button
        variant="outlined"
        color="primary"
        startIcon={<DownloadIcon />}
        onClick={handleExport}
        disabled={!canExport}
      >
        Export MIDI
      </Button>

      <FormControlLabel
        control={
          <Switch
            checked={isCounterpointAbove}
            onChange={handleChangePosition}
            color="primary"
          />
        }
        label={`Counterpoint ${isCounterpointAbove ? "Above" : "Below"}`}
      />
    </Box>
  );
}

export default InputControls;
