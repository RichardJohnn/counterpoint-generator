import { createTheme } from "@mui/material";

// Renaissance-inspired palette: old parchment and ink
const theme = createTheme({
  palette: {
    primary: {
      main: "#3E2723", // Deep brown ink color
      light: "#5D4037",
      dark: "#2E1B14",
      contrastText: "#F9F5E9",
    },
    secondary: {
      main: "#8D6E63", // Warm sepia tone
      light: "#A1887F",
      dark: "#6D4C41",
      contrastText: "#EFEBE9",
    },
    background: {
      default: "#F5F1E4", // Aged parchment
      paper: "#F9F5E9", // Lighter parchment for elements
    },
    text: {
      primary: "#3E2723", // Dark brown for primary text
      secondary: "#5D4037", // Medium brown for secondary text
    },
    error: {
      main: "#B71C1C", // Deep red for errors, similar to red ink annotations
      light: "#C62828",
      dark: "#7F0000",
    },
    warning: {
      main: "#BF360C", // Burnt orange for warnings
      light: "#D84315",
      dark: "#870000",
    },
    info: {
      main: "#1565C0", // Deep blue, like historical blue ink
      light: "#1976D2",
      dark: "#0D47A1",
    },
    success: {
      main: "#2E7D32", // Dark green from historical pigments
      light: "#388E3C",
      dark: "#1B5E20",
    },
    divider: "rgba(62, 39, 35, 0.15)", // Subtle brown divider
  },
  typography: {
    fontFamily: [
      "Baskerville",
      "Palatino",
      "Garamond",
      "Times New Roman",
      "serif",
    ].join(","),
    h1: {
      fontWeight: 500,
      letterSpacing: "-0.01em",
    },
    h2: {
      fontWeight: 500,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4, // Slightly rounded corners
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(rgba(244, 237, 220, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 237, 220, 0.3) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          boxShadow: "0px 2px 6px rgba(62, 39, 35, 0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 4,
          padding: "8px 16px",
        },
        contained: {
          boxShadow: "0px 2px 4px rgba(62, 39, 35, 0.2)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "linear-gradient(to right, #5D4037, #3E2723)",
          boxShadow: "0px 2px 8px rgba(62, 39, 35, 0.2)",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#5D4037",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        track: {
          backgroundColor: "#D7CCC8",
        },
      },
    },
  },
});

export default theme;
