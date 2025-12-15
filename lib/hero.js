const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        foreground: "#15141A",
        default: "#EDEDEF",

        primary: "#7DBE46",
        danger: "#B91C1C",
        warning: "#FFB647",
        success: "#65C800",
      },
    },
  },
});
