# Feature Request: `light-dark()` color resolver for theme/mode composition

## Summary

Add a built-in resolver (similar to the existing `fluid` resolver) that outputs semantic color tokens as CSS `light-dark(lightValue, darkValue)` expressions, enabling a clean theme × mode architecture without duplicating variable blocks.

## Motivation

The current `modifier` approach to dark mode generates two separate CSS blocks:

```css
:root {
  --color-surface-default: #ffffff;
}

[data-mode='dark'] {
  --color-surface-default: #0a0a0a;
}
```

This works, but has two friction points:

1. Duplication — every semantic color token appears twice in the output.
2. Theme × mode scaling — adding N themes × 2 modes means N×2 CSS blocks, where ideally it would be N blocks (one per theme, each encoding both modes).

CSS light-dark() solves both cleanly:

```css
:root {
  color-scheme: light dark;
  --color-surface-default: light-dark(#ffffff, #0a0a0a);
}

[data-theme='ocean'] {
  color-scheme: light dark;
  --color-surface-default: light-dark(#f0fdfa, #042f2e);
}
```

Mode switching then requires only color-scheme: dark on any ancestor element — no JS class toggling, no specificity fights, works with OS preference automatically.

## Proposed API

A new $type or resolver strategy that accepts paired light/dark token refs:

### Option A — new $type: "light-dark"

```json
{
  "color": {
    "surface": {
      "default": {
        "$type": "light-dark",
        "$value": {
          "light": "{color.neutral.50}",
          "dark": "{color.neutral.950}"
        }
      }
    }
  }
}
```

Generates:

```css
--color-surface-default: light-dark(oklch(...), oklch(...));
```

### Option B — resolver-level light-dark transform

Similar to how fluid is configured in sugarcube.config.ts, a lightDark transform that accepts a pair of token sets and zips them into light-dark() output:

```ts
// sugarcube.config.ts
export default defineConfig({
  transforms: {
    lightDark: {
      light: './design-tokens/themes/default-light.json',
      dark: './design-tokens/themes/default-dark.json',
    },
  },
});
```

#### Relationship to fluid resolver

The existing fluid resolver is a good precedent — it takes dimension tokens and applies a mathematical transform (clamp()) at output time rather than at token definition time. A light-dark resolver would do the same for color tokens: take two resolved color values and compose them into a CSS function at output time.

The key insight is the same: the transform lives at the CSS generation layer, not the token definition layer, which is why trying to put light-dark() in a token $value string fails validation today.

### Workaround (current state)

Without this feature, the only option is to bypass sugarcube for the semantic color layer entirely — generate palette vars via sugarcube, then hand-write a per-theme CSS file using light-dark() against those palette vars. This works but loses the token-graph benefits (type checking, alias resolution, etc.) for the semantic layer.

### Browser support

`light-dark()` is baseline 2024, supported in all evergreen browsers.
