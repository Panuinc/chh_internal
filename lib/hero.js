const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        default: "#DCDCDC",

        primary: "#4456E9",
        secondary: "#FF8A00",
        danger: "#FF0076",
        warning: "#FFB441",
        success: "#10B981",
      },
    },
  },
});
