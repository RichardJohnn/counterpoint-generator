import { MusicNote } from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";

function Header() {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <MusicNote fontSize="large" color="primary" />
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: "bold",
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Species Counterpoint Generator
      </Typography>
    </Box>
  );
}

export default Header;
