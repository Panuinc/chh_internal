const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        default: "#D4D4D8",
        primary: "#006FEE",
        secondary: "#9353d3",
        danger: "#f31260",
        warning: "#f5a524",
        success: "#7DBE46",
      },
    },
  },
});
