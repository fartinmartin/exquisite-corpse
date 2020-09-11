require("dotenv").config();

module.exports = {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  mode: "universal",
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: "server",
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    title: `exquisite corpse club` || "",
    script: [{ src: "/polyfills/createImageBitmap.js", body: true }],
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: `an online collaborative drawing game. ✏️` || ""
      }
    ]
  },
  /*
   ** Dev sever config, used to fix cache issues
   */
  server: {
    port: 8000, // default: 3000
    // host: "localhost", // default: localhost
    host: "0.0.0.0"
  },
  /*
   ** Global CSS
   */
  css: ["~/assets/css/main.scss"],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [{ src: "~/plugins/vue-touch", ssr: false }],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   ** See:
   **   1. https://github.com/nuxt-community/dotenv-module
   **   2. https://pwa.nuxtjs.org/setup.html
   */
  buildModules: ["@nuxtjs/dotenv", "@nuxtjs/pwa"],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/firebase", "@nuxtjs/svg", "nuxt-password-protect"],
  /*
   ** Nuxt.js modules
   */
  passwordProtect: {
    formPath: "/admin/login",
    password: process.env.ECC_ADMIN_PASSWORD,
    tokenSeed: 101010,
    queryString: "_pw",
    cookieName: "_password",
    cookie: {
      prefix: "",
      expires: 5
    }
  },
  /*
   ** Firebase config
   ** See:
   **   1. https://firebase.nuxtjs.org/guide/getting-started/#simple-configuration
   **   2. https://github.com/nuxt-community/firebase-module
   */
  firebase: {
    config: {
      production: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGEBUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
      },
      development: {
        apiKey: process.env.FIREBASE_API_KEY_DEV,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN_DEV,
        databaseURL: process.env.FIREBASE_DATABASE_URL_DEV,
        projectId: process.env.FIREBASE_PROJECT_ID_DEV,
        storageBucket: process.env.FIREBASE_STORAGEBUCKET_DEV,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID_DEV,
        appId: process.env.FIREBASE_APP_ID_DEV,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID_DEV
      }
    },
    services: {
      auth: {
        ssr: true
      },
      firestore: true,
      analytics: true
    },
    onFirebaseHosting: true
  },
  /*
   ** @nuxtjs/pwa configuration
   ** See https://pwa.nuxtjs.org/modules/meta.html
   */
  pwa: {
    meta: {
      title: "exquisite corpse club",
      author: "martin lindberg",
      description: "an online collaborative drawing game. ✏️",
      ogHost: "https://exquisitecorpse.club"
    },
    manifest: {
      name: "exquisite corpse club",
      short_name: "ecc",
      lang: "en"
    }
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {},
  /*
   ** Loading bar
   ** See https://nuxtjs.org/api/configuration-loading/
   */
  loading: "~/components/LoadingBar.vue"
};
