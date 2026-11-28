<!--
  A drawn pencil for "draw": slightly wobbly lines like the arrow, nib down
  and to the left, with a little scribble trailing from the point. It
  scribbles (a small writing wiggle) when its link is hovered.
-->
<svg class="pencil" viewBox="0 0 28 18" aria-hidden="true">
  <!-- body -->
  <path d="M10.2 11.6 C 14 8.2, 18.4 4.6, 22.3 1.8 C 23.6 2.4, 24.6 3.4, 25.3 4.7 C 21.4 7.6, 17.2 11.1, 13.3 14.4" />
  <!-- ferrule -->
  <path d="M20.4 3.2 C 21.6 3.9, 22.6 4.9, 23.3 6.1" />
  <!-- point -->
  <path d="M10.2 11.6 C 9.5 13.1, 8.9 14.6, 8.5 16 C 10.1 15.6, 11.8 15.1, 13.3 14.4" />
  <!-- the line it just drew -->
  <path class="trail" d="M1.4 15.6 C 3 14.1, 4.4 16.9, 6 15.4" />
</svg>

<style>
  .pencil {
    width: 1.35em;
    height: 0.9em;
    margin-left: 0.25em;
    flex: none;
    overflow: visible;
    transform-origin: 30% 90%;
  }

  .pencil path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .trail {
    stroke-dasharray: 8;
    stroke-dashoffset: 0;
  }

  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    :global(a:hover) > .pencil,
    :global(a:focus-visible) > .pencil {
      animation: scribble 420ms ease-in-out infinite;
    }

    :global(a:hover) > .pencil .trail,
    :global(a:focus-visible) > .pencil .trail {
      animation: draw-trail 840ms linear infinite;
    }
  }

  @keyframes scribble {
    0%,
    100% {
      transform: rotate(0deg) translate(0, 0);
    }
    25% {
      transform: rotate(-6deg) translate(-1px, 0.5px);
    }
    75% {
      transform: rotate(4deg) translate(1px, -0.5px);
    }
  }

  @keyframes draw-trail {
    from {
      stroke-dashoffset: 8;
    }
    to {
      stroke-dashoffset: -8;
    }
  }
</style>
