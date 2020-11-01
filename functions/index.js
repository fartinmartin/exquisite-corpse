// https://www.youtube.com/watch?v=_aTvdnqY3ek

const functions = require("firebase-functions");
const { Nuxt } = require("nuxt-start");
const nuxtConfig = require("./nuxt.config.js");

const config = {
  ...nuxtConfig,
  dev: false,
  debug: false,
  buildDir: "nuxt"
};

const nuxt = new Nuxt(config);

exports.ssrapp = functions.https.onRequest(async (req, res) => {
  // ⚠️ how long can we afford to go?
  //
  // since this cache setting is only controlling the caching of the front-end
  // and the drawing data is being loaded client side via JS... could it be 31536000 (a year)??
  //
  // i guess it depends on how often i will be updating this project, right?
  //
  // or is the firebase hosting CDN smart enough to know content has changed? 🤔
  // https://www.youtube.com/watch?v=LOeioOKUKI8
  res.set("Cache-Control", "public, max-age=604800, s-maxage=1209600"); // 604800s = 1 week
  await nuxt.ready();
  nuxt.render(req, res);
});
