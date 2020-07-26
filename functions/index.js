// https://www.youtube.com/watch?v=_aTvdnqY3ek

const functions = require("firebase-functions");
const { Nuxt } = require("nuxt-start");
const nuxtConfig = require("./nuxt.config.js");

const config = {
  ...nuxtConfig,
  dev: false,
  debug: false,
  buildDir: "nuxt",
};

const nuxt = new Nuxt(config);

exports.ssrapp = functions.https.onRequest(async (req, res) => {
  await nuxt.ready();
  // res.set("Cache-Control", "public, max-age=30, s-maxage=30");
  nuxt.render(req, res);
});
