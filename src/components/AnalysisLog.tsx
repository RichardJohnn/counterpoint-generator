import { useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Typography,
  Chip,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { GenerationAnalysis } from "../types";

interface AnalysisLogProps {
  analysis: GenerationAnalysis | null;
}

function AnalysisLog({ analysis }: AnalysisLogProps) {
  const [expanded, setExpanded] = useState(false);

  if (!analysis || analysis.noteAnalyses.length === 0) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Analysis: {analysis.summary}
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {analysis.noteAnalyses.map((note, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                p: 1,
                borderLeft: "3px solid",
                borderColor: note.ruleResults.every((r) => r.passed)
                  ? "success.main"
                  : "warning.main",
                bgcolor: "background.default",
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                Note {note.noteIndex + 1}: CF {note.cfPitch} → CP {note.cpPitch}{" "}
                ({note.interval})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {note.ruleResults.map((result, rIdx) => (
                  <Chip
                    key={rIdx}
                    size="small"
                    icon={
                      result.passed ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <CancelIcon fontSize="small" />
                      )
                    }
                    label={result.message}
                    color={result.passed ? "success" : "error"}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
}

export default AnalysisLog;
