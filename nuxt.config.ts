import * as path from "path";

import { Configuration } from "@nuxt/types";

const isDev = process.env.NODE_ENV !== "production";
const envPath = path.resolve(process.cwd(), `.${isDev ? "development" : "production"}.env`);

require("dotenv").config({ path: envPath });

export const config: Configuration = {
  axios: {},

  /*
   ** Build configuration
   */
  build: {
    cache: true,
    transpile: [/typed-vuex/, "vuelidate-property-decorators"]

    /*
     ** You can extend webpack config here
     */
    // extend(config, ctx) {}
  },

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    "@nuxt/components",
    "@nuxt/typescript-build",
    "@nuxtjs/dotenv",
    "@nuxtjs/tailwindcss",
    "nuxt-typed-vuex"
  ],

  components: true,

  /*
   ** Global CSS
   */
  css: ["./assets/scss/main.scss"],

  dev: isDev,

  dotenv: {
    path: envPath
  },

  globalName: "bytebin",

  /*
   ** Headers of the page
   */
  head: {
    htmlAttrs: {
      lang: "en"
    },
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
      }
    ],
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
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
  modules: ["@nuxtjs/axios", "@nuxtjs/recaptcha"],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: "./plugins/axios.plugin" },
    { src: "./plugins/spinners.plugin" },
    { src: "./plugins/vuelidate.plugin" }
  ],

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
    port: 3000,
    host: "0.0.0.0"
  },

  srcDir: path.join(__dirname, "./client"),

  // https://typescript.nuxtjs.org/guide/setup.html#module-options
  typescript: {}
};
