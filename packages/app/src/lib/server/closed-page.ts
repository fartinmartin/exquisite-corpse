import type { SiteState } from "#lib/site-mode.ts";

/**
 * The holding page while the site is closed. Plain HTML so it doesn't depend
 * on anything that might be the reason we closed (data, functions, quotas).
 */
export function closedPage(state: SiteState): Response {
  const message =
    state.reason === "budget"
      ? "we've hit our limit for the month. we'll be back soon!"
      : "we're temporarily closed. back soon!";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>exquisite corpse club ▪ back soon</title>
<style>
  @font-face { font-family: "Space Mono"; src: url("/fonts/spacemono/SpaceMono-Regular.woff2") format("woff2"); font-display: swap; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #deebff; /* --lighter-blue */ font-family: "Space Mono", monospace; color: #231f20; }
  main { background: #fff; border: 2px solid #fcba03; box-shadow: 4px 4px 0 #fb9200; /* --yellow, --orange */ padding: 2rem; max-width: 28rem; margin: 1rem; }
  h1 { font-size: 1rem; margin: 0 0 1rem; }
  p { margin: 0; }
</style>
</head>
<body><main><h1>exquisite corpse club</h1><p>${message}</p></main></body>
</html>`;

  return new Response(html, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": "3600",
      "cache-control": "no-store",
    },
  });
}
