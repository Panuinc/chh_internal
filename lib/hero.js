const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        foreground: "#11181C",
        default: "#d4d4d8",

        primary: "#006FEE",
        secondary: "#7828c8",
        danger: "#f31260",
        warning: "#f5a524",
        success: "#17c964",
      },
    },
  },
});
