// Per-IP rate limit for likes. Returning nothing passes the request on.
// Netlify's free plan allows two code-based rules per project.
export default () => {};

export const config = {
  path: "/_app/remote/*/toggleLike",
  rateLimit: {
    windowLimit: 30,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
