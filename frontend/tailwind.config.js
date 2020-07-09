/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#F3F3FB",
          200: "#E0E2F5",
          300: "#CED1EF",
          400: "#A9AEE4",
          500: "#848BD8",
          600: "#777DC2",
          700: "#4F5382",
          800: "#3B3F61",
          900: "#282A41"
        },

        secondary: {
          100: "#EBEFFA",
          200: "#CED7F2",
          300: "#B0BFEA",
          400: "#748EDA",
          500: "#395ECA",
          600: "#3355B6",
          700: "#223879",
          800: "#1A2A5B",
          900: "#111C3D"
        }
      },

      screens: {
        xs: "384px",
        xs_max: { max: "384px" },
        sm_max: { max: "576px" },
        md_max: { max: "768px" },
        lg_max: { max: "1024px" },
        xl_max: { max: "1280px" }
      }
    }
  },
  variants: {},
  plugins: [],
  purge: {
    // Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
    enabled: process.env.NODE_ENV === "production",
    content: [
      "components/**/*.vue",
      "layouts/**/*.vue",
      "pages/**/*.vue",
      "plugins/**/*.js",
      "nuxt.config.js"
    ]
  }
};
