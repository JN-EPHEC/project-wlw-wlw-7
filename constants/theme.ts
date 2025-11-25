// constants/theme.ts

/**
 * Thème global de l'app (couleurs + typos)
 */

export const Colors = {
  light: {
    // si un jour tu fais un mode clair, tu pourras l’affiner,
    // pour l’instant on met quelque chose de cohérent
    text: "#11181C",
    background: "#FFFFFF",
    tint: "#3A2A60",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#3A2A60",

    // tokens communs
    primary: "#3A2A60",
    secondary: "#B57BFF",
    textPrimary: "#11181C",
    textSecondary: "#4B5563",
    textDisabled: "#6B7280",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
    neutralGray800: "#1F2937",
    overlay: "rgba(59,130,246,0.6)",

    logoGradientStart: "#A259FF",
    logoGradientEnd: "#00A3FF",
    backgroundGradientStart: "#110A1E",
    backgroundGradientEnd: "#0A0612",
  },

  dark: {
    // ce que ton app utilise vraiment
    text: "#F9FAFB",
    background: "#0A0612", // couleur dominante du gradient
    tint: "#B57BFF",
    icon: "#9CA3AF",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#B57BFF",

    primary: "#3A2A60",
    secondary: "#B57BFF",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    textDisabled: "#6B7280",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
    neutralGray800: "#1F2937",
    overlay: "rgba(59,130,246,0.6)",

    logoGradientStart: "#A259FF",
    logoGradientEnd: "#00A3FF",
    backgroundGradientStart: "#110A1E",
    backgroundGradientEnd: "#0A0612",
  },
};

// familles de fonts utilisées par les composants "themed-text" / "themed-view"
export const Fonts = {
  // ton texte par défaut = Poppins
  sans: "Poppins-Regular",
  serif: "Poppins-Regular",
  rounded: "Poppins-Medium",
  mono: "Poppins-Regular",
};

// optionnel mais pratique : tokens de typo réutilisables
export const Typography = {
  h1: { fontFamily: "Poppins-Bold", fontSize: 32 },
  h2: { fontFamily: "Poppins-SemiBold", fontSize: 22 },
  body: { fontFamily: "Poppins-Regular", fontSize: 16 },
  label: { fontFamily: "Poppins-Medium", fontSize: 14 },
  button: { fontFamily: "Poppins-SemiBold", fontSize: 16 },
};
