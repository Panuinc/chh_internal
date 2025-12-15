const { heroui } = require("@heroui/theme");

module.exports = heroui({
  themes: {
    light: {
      colors: {
        background: "#EFEFEF",
        foreground: "#231F20",
        default: "#C6C6C6",

        primary: "#0837FF",
        danger: "#D33045",
        warning: "#F7B03E",
        success: "#28AF68",
      },
    },
  },
});
