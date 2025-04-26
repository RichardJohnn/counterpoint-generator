import { useState } from "react";
import { useCounterpoint } from "../hooks";
import { Species } from "../types";
import PlayIcon from "@mui/icons-material/PlayArrow"
import StopIcon from "@mui/icons-material/Stop"
import RestartIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo"
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
  Switch,
  Typography,
} from "@mui/material";

interface ControlPanelProps {
  onPlay?: () => void;
  onStop?: () => void;
  onReset?: () => void;
}

function ControlPanel({ onPlay, onStop, onReset }: ControlPanelProps) {
  const {
    selectedSpecies,
    isCounterpointAbove,
    setSpecies,
    setPosition,
    undo,
    history,
  } = useCounterpoint();

  const [isPlaying, setIsPlaying] = useState(false);

  function handleSpeciesChange(event: SelectChangeEvent) {
    const newSpecies = parseInt(event.target.value) as Species;
    setSpecies(newSpecies);
  }

  function handlePlayToggle() {
    if (isPlaying) {
      setIsPlaying(false);
      onStop?.();
    } else {
      setIsPlaying(true);
      onPlay?.();
    }
  }

  function handleReset() {
    setIsPlaying(false);
    onReset?.();
  }

  function handleChangePosition(event: React.ChangeEvent<HTMLInputElement>) {
    const isAbove = event.target.checked;
    setPosition(isAbove);
  }

  function handleUndo() {
    undo();
  }

  const canUndo = history.length > 0;

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
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 4}}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ControlPanel;
