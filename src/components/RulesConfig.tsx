import { useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Slider,
  Typography,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { RuleConfig } from "../types";

interface RulesConfigProps {
  rules: RuleConfig[];
  onChange: (rules: RuleConfig[]) => void;
}

function RulesConfig({ rules, onChange }: RulesConfigProps) {
  const [expanded, setExpanded] = useState(false);

  const handleWeightChange = (ruleId: string, newWeight: number) => {
    const updatedRules = rules.map((rule) =>
      rule.id === ruleId ? { ...rule, weight: newWeight } : rule
    );
    onChange(updatedRules);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          Rule Weights
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1 }}>
          {rules.map((rule) => (
            <Box key={rule.id} sx={{ mb: 2 }}>
              <Tooltip title={rule.description} placement="top-start">
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
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export default RulesConfig;
