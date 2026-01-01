import { useCounterpoint, usePlayback } from "../hooks";
import PlayIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import {
  Box,
  Button,
  Slider,
  Typography,
} from "@mui/material";

interface PlaybackControlsProps {
  tempo: number;
  onTempoChange: (tempo: number) => void;
  onPlay?: () => void;
  onStop?: () => void;
}

function PlaybackControls({
  tempo,
  onTempoChange,
  onPlay,
  onStop,
}: PlaybackControlsProps) {
  const { cantusFirmus, counterpoint } = useCounterpoint();
  const { isPlaying, play, stop, setTempo: setPlaybackTempo } = usePlayback();

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
    onTempoChange(newTempo);
    setPlaybackTempo(newTempo);
  }

  const hasNotes = cantusFirmus.length > 0 || counterpoint.length > 0;

  return (
    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
      <Typography variant="subtitle2" sx={{ minWidth: 60 }}>
        Playback
      </Typography>

      <Button
        variant="contained"
        color={isPlaying ? "error" : "primary"}
        startIcon={isPlaying ? <StopIcon /> : <PlayIcon />}
        onClick={handlePlayToggle}
        disabled={!hasNotes}
        sx={{ minWidth: 100 }}
      >
        {isPlaying ? "Stop" : "Play"}
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 200 }}>
        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
          Tempo: {tempo} BPM
        </Typography>
        <Slider
          value={tempo}
          onChange={handleTempoChange}
          min={40}
          max={120}
          valueLabelDisplay="auto"
          size="small"
          sx={{ width: 120 }}
        />
      </Box>
    </Box>
  );
}

export default PlaybackControls;
