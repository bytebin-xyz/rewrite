import { Configuration } from "@nuxt/types";

import { ProvidePlugin } from "webpack";

const isDev = process.env.NODE_ENV !== "production";

require("dotenv").config({ path: `.env.${isDev ? "development" : "production"}` });

const config: Configuration = {
  axios: {
    baseURL: `${isDev ? "http" : "https"}://${process.env.API_DOMAIN}`,
    credentials: true
  },

  /*
   ** Build configuration
   */
  build: {
    cache: true,
    transpile: [/typed-vuex/, "vuelidate-property-decorators"],

    /*
     ** You can extend webpack config here
     */
    extend(config, _ctx) {
      config.plugins = [
        ...(config.plugins || []),
        new ProvidePlugin({
          mapboxgl: "mapbox-gl"
        })
      ];
    }
  },

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    "@nuxt/typescript-build",
    "@nuxtjs/pwa",
    "@nuxtjs/stylelint-module", // https://github.com/nuxt-community/stylelint-module
    "@nuxtjs/tailwindcss", // https://github.com/nuxt-community/nuxt-tailwindcss
    "nuxt-typed-vuex"
  ],

  components: true,

  /*
   ** Global CSS
   */
  css: ["./assets/scss/main.scss", "./assets/scss/toast.scss"],

  dev: isDev,

  globalName: "bytebin",

  /*
   ** Headers of the page
   */
  head: {
    htmlAttrs: {
      lang: "en"
    },
    link: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
      }
    ],
    title: "Bytebin"
  },

  layoutTransition: {
    name: "fade"
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: "#848BD8",
    continuous: true,
    failedColor: "#feb2b2",
    throttle: 10
  },

  mode: "universal",

  modern: isDev ? false : "client",

  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/axios", "@nuxtjs/pwa", "@nuxtjs/recaptcha", "@nuxtjs/toast"],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: "./plugins/content-placeholders.plugin", mode: "client" },
    { src: "./plugins/axios.plugin" },
    { src: "./plugins/spinners.plugin", mode: "client" },
    { src: "./plugins/vue-js-modal.plugin", mode: "client" },
    { src: "./plugins/vuelidate.plugin" }
  ],

  pwa: {
    manifest: {
      background_color: "#3B3F61",
      display: "standalone",
      name: "Bytebin",
      short_name: "Bytebin"
    },

    meta: {
      favicon: true,
      name: "Bytebin",
      theme_color: "#3B3F61"
    }
  },

  recaptcha: {
    hideBadge: true,
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    version: 3
  },

  render: {
    http2: {
      push: true
    }
  },

  router: {
    middleware: ["auth.middleware", "guest-only.middleware"]
  },

  server: {
    port: process.env.PORT,
    host: "0.0.0.0"
  },

  target: "server",

  toast: {
    duration: 5000,
    keepOnHover: true,
    position: "bottom-center"
  },

  // https://typescript.nuxtjs.org/guide/setup.html#module-options
  typescript: {}
};

export default config;
