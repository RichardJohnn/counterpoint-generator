import { useState, useEffect } from "react";
import { useCounterpoint } from "../hooks";
import {
  Species,
  RuleConfig,
  GenerationAnalysis,
  getRulesForSpecies,
} from "../types";
import { generateFirstSpecies, generateSecondSpecies, generateThirdSpecies, generateFourthSpecies } from "../utils";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Tooltip,
  Typography,
} from "@mui/material";

interface GenerationControlsProps {
  onGenerate?: (analysis: GenerationAnalysis) => void;
  onGenerateError?: (error: string) => void;
}

function GenerationControls({
  onGenerate,
  onGenerateError,
}: GenerationControlsProps) {
  const {
    cantusFirmus,
    selectedSpecies,
    selectedMode,
    selectedFinalis,
    isCounterpointAbove,
    setSpecies,
    setCounterpoint,
    undo,
    history,
  } = useCounterpoint();

  const [rules, setRules] = useState<RuleConfig[]>(() =>
    getRulesForSpecies(selectedSpecies).map(r => ({ ...r }))
  );

  // Update rules when species changes
  useEffect(() => {
    setRules(getRulesForSpecies(selectedSpecies).map(r => ({ ...r })));
  }, [selectedSpecies]);

  function handleSpeciesChange(event: SelectChangeEvent) {
    const newSpecies = parseInt(event.target.value) as Species;
    setSpecies(newSpecies);
  }

  function handleGenerate() {
    if (cantusFirmus.length === 0) {
      onGenerateError?.("Please enter a cantus firmus first");
      return;
    }

    let result;

    switch (selectedSpecies) {
      case 1:
        result = generateFirstSpecies(cantusFirmus, isCounterpointAbove, rules, selectedMode, selectedFinalis);
        break;
      case 2:
        result = generateSecondSpecies(cantusFirmus, isCounterpointAbove, rules, selectedMode, selectedFinalis);
        break;
      case 3:
        result = generateThirdSpecies(cantusFirmus, isCounterpointAbove, rules, selectedMode, selectedFinalis);
        break;
      case 4:
        result = generateFourthSpecies(cantusFirmus, isCounterpointAbove, rules, selectedMode, selectedFinalis);
        break;
      default:
        onGenerateError?.(`Species ${selectedSpecies} is not yet implemented`);
        return;
    }

    if (result.success) {
      setCounterpoint(result.notes);
      onGenerate?.(result.analysis);
    } else {
      onGenerateError?.(result.error || "Failed to generate counterpoint");
    }
  }

  function handleWeightChange(ruleId: string, newWeight: number) {
    const updatedRules = rules.map((rule) =>
      rule.id === ruleId ? { ...rule, weight: newWeight } : rule
    );
    setRules(updatedRules);
  }

  function handleUndo() {
    undo();
  }

  const canUndo = history.length > 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generation
      </Typography>

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, sm: 3 }}>
          <FormControl fullWidth size="small">
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

          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AutoFixHighIcon />}
              onClick={handleGenerate}
              disabled={cantusFirmus.length === 0}
              fullWidth
            >
              Generate
            </Button>

            <Button
              variant="outlined"
              color="primary"
              startIcon={<UndoIcon />}
              onClick={handleUndo}
              disabled={!canUndo}
            >
              Undo
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 9 }}>
          <Typography variant="subtitle2" gutterBottom>
            Rule Weights
          </Typography>
          <Grid container spacing={2}>
            {rules.map((rule) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={rule.id}>
                <Tooltip title={rule.description} placement="top">
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {rule.name}: {rule.weight}%
                  </Typography>
                </Tooltip>
                <Slider
                  value={rule.weight}
                  onChange={(_e, value) =>
                    handleWeightChange(rule.id, value as number)
                  }
                  min={0}
                  max={100}
                  size="small"
                  valueLabelDisplay="auto"
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

export default GenerationControls;
