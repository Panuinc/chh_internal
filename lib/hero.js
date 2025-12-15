const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        foreground: "#15141A",
        default: "#EDEDEF",

        primary: "#C7FC3D",
        danger: "#B91C1C",
        warning: "#D97706",
        success: "#65C800",
      },
    },
  },
});
