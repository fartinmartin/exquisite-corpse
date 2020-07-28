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
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: `an online collaborative drawing game. ✏️` || "",
      },
    ],
  },
  /*
   ** Dev sever config, used to fix cache issues
   */
  // server: {
  //   port: 8000, // default: 3000
  //   host: "localhost" // default: localhost
  // },
  /*
   ** Global CSS
   */
  css: ["~/assets/css/main.scss"],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [],
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
      expires: 5,
    },
  },
  /*
   ** Firebase config
   ** See:
   **   1. https://firebase.nuxtjs.org/guide/getting-started/#simple-configuration
   **   2. https://github.com/nuxt-community/firebase-module
   */
  firebase: {
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGEBUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    services: {
      auth: {
        ssr: true,
      },
      firestore: true,
      analytics: true,
    },
    onFirebaseHosting: true,
  },
  /*
   ** @nuxtjs/pwa configuration
   ** See https://pwa.nuxtjs.org/modules/meta.html
   */
  pwa: {
    meta: {
      title: "Exquisite Corpse Club",
      author: "Martin Lindberg",
      description: "An online collaborative drawing game. 🔪",
    },
    manifest: {
      name: "Exquisite Corpse Club",
      short_name: "ECC",
      lang: "en",
    },
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
  loading: {
    color: "#fcda00",
    failedColor: "#f44e3b",
  },
};
