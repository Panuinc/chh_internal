const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        default: "#D4D4D8",
        primary: "#78C653",
        secondary: "#F37021",
        danger: "#f31260",
        warning: "#f5a524",
        success: "#7DBE46",
      },
    },
  },
});
