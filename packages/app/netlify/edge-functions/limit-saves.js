// Per-IP rate limit for saving drawings. Returning nothing passes the request on.
// Netlify's free plan allows two code-based rules per project.
export default () => {};

export const config = {
  path: "/_app/remote/*/saveDrawing",
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
