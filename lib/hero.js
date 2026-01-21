const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        default: "#D1D2D4",

        primary: "#4456E9",
        secondary: "#FF8A00",
        danger: "#FF0076",
        warning: "#FFB441",
        success: "#65A20E",
      },
    },
  },
});
