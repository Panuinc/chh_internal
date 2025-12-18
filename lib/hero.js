const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
        default: "#EBEDF1",

        primary: "#7DBE46",
        danger: "#EF4444",
        warning: "#FFB647",
        success: "#65C800",
      },
    },
  },
});
