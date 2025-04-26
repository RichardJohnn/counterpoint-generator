import { Close } from "@mui/icons-material";
import { Alert, Box, IconButton, Typography } from "@mui/material";

interface StatusBarProps {
  message?: string;
  severity?: "success" | "info" | "warning" | "error";
  onClear?: () => void;
}

function StatusBar({
  message = "",
  severity = "info",
  onClear,
}: StatusBarProps) {
  if (!message) {
    return (
      <Box
        sx={{ p: 1, minHeight: "64px", display: "flex", alignItems: "center" }}
      >
        <Typography variant="body2" color="text.secondary">
          Ready
        </Typography>
      </Box>
    );
  }

  return (
    <Alert
      severity={severity}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={onClear}
        >
          <Close fontSize="inherit" />
        </IconButton>
      }
      sx={{ width: "100%" }}
    >
      {message}
    </Alert>
  );
}

export default StatusBar;
