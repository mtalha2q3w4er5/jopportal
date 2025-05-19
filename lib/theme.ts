import { createTheme } from "@/components/ui/theme"

export const theme = createTheme({
  colors: {
    primary: {
      DEFAULT: "#6C3CE9",
      foreground: "#FFFFFF",
      50: "#F4F1FE",
      100: "#E9E3FD",
      200: "#D3C7FB",
      300: "#BDABF9",
      400: "#A78FF7",
      500: "#9173F5",
      600: "#7B57F3",
      700: "#653BF1",
      800: "#4F1FEF",
      900: "#3903ED",
    },
    secondary: {
      DEFAULT: "#A259FF",
      foreground: "#FFFFFF",
    },
    background: {
      DEFAULT: "#FFFFFF",
    },
    card: {
      DEFAULT: "#FFFFFF",
    },
  },
  borderRadius: {
    lg: "0.75rem",
    md: "0.5rem",
    sm: "0.25rem",
  },
})
