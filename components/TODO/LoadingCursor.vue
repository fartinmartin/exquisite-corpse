<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 32 39.98"
    id="hourglass"
  >
    <defs>
      <style>
        .cls-1,
        .cls-3,
        .cls-5,
        .cls-6 {
          fill: none;
        }

        .cls-2 {
          fill: #e6e6e6;
        }

        .cls-3 {
          stroke: #f2f2f2;
        }

        .cls-3,
        .cls-5,
        .cls-6 {
          stroke-miterlimit: 10;
          stroke-width: 4px;
        }

        .cls-4 {
          clip-path: url(#clip-path);
        }

        .cls-5 {
          stroke: #ccc;
        }

        .cls-6 {
          stroke: #231f20;
        }

        .cls-7 {
          fill: gray;
        }
      </style>
      <clipPath id="clip-path">
        <polygon
          class="cls-1"
          points="29 36.98 24 31.98 7 31.98 14 24.98 14 12.98 7 6.98 2 2 3 36.98 29 36.98"
        />
      </clipPath>
    </defs>
    <g>
      <g id="Loading">
        <g id="Frame">
          <polygon
            class="cls-2"
            points="30 37.98 30 30.98 23 23.98 23 15.98 30 8.98 30 2 2 2 2 8.98 9 15.98 9 23.98 2 30.98 2 37.98 30 37.98"
          />
          <g id="Light">
            <polyline
              id="shine"
              class="cls-3"
              points="28 37.98 28 31.81 21 24.81 21 15.15 28 8.15 28 3.98 4 3.98"
            />
            <g class="cls-4">
              <polyline
                class="cls-5"
                id="shade"
                points="4 1.98 4 8.15 11 15.15 11 24.81 4 31.81 4 35.98 28 35.98"
              />
            </g>
          </g>
          <polygon
            id="Stroke"
            class="cls-6"
            points="30 37.98 30 30.98 23 23.98 23 15.98 30 8.98 30 2 2 2 2 8.98 9 15.98 9 23.98 2 30.98 2 37.98 30 37.98"
          />
        </g>
        <g id="dots">
          <rect id="top-1" class="cls-7" x="9" y="7" width="2" height="2" />
          <rect id="top-2" class="cls-7" x="15" y="7" width="2" height="2" />
          <rect id="top-3" class="cls-7" x="21" y="7" width="2" height="2" />
          <rect id="top-4" class="cls-7" x="12" y="10" width="2" height="2" />
          <rect id="top-5" class="cls-7" x="18" y="10" width="2" height="2" />
          <rect id="top-6" class="cls-7" x="15" y="13" width="2" height="2" />

          <rect
            id="mid-1"
            class="cls-7"
            x="15"
            y="18.98"
            width="2"
            height="2"
          />

          <rect
            id="bot-1"
            class="cls-7"
            x="15"
            y="24.98"
            width="2"
            height="2"
          />
          <rect
            id="bot-2"
            class="cls-7"
            x="12"
            y="27.98"
            width="2"
            height="2"
          />
          <rect
            id="bot-3"
            class="cls-7"
            x="18"
            y="27.98"
            width="2"
            height="2"
          />
          <rect id="bot-4" class="cls-7" x="9" y="30.98" width="2" height="2" />
          <rect
            id="bot-5"
            class="cls-7"
            x="15"
            y="30.98"
            width="2"
            height="2"
          />
          <rect
            id="bot-6"
            class="cls-7"
            x="21"
            y="30.98"
            width="2"
            height="2"
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
#hourglass {
  --duration: 6s;
  -webkit-animation: spin var(--duration) infinite;
  animation: spin var(--duration) infinite;
}
#hourglass #shine {
  -webkit-animation: shine-color var(--duration) infinite;
  animation: shine-color var(--duration) infinite;
}
#hourglass #shade {
  -webkit-animation: shade-color var(--duration) infinite;
  animation: shade-color var(--duration) infinite;
}
#hourglass #mid-1 {
  -webkit-animation: mid-1 var(--duration) infinite;
  animation: mid-1 var(--duration) infinite;
}

#top-1 {
  -webkit-animation: top-1 var(--duration) infinite;
  animation: top-1 var(--duration) infinite;
}

@-webkit-keyframes top-1 {
  0%,
  41% {
    opacity: 1;
  }
  42%,
  100% {
    opacity: 0;
  }
}

@keyframes top-1 {
  0%,
  41% {
    opacity: 1;
  }
  42%,
  100% {
    opacity: 0;
  }
}
#bot-1 {
  -webkit-animation: bot-1 var(--duration) infinite;
  animation: bot-1 var(--duration) infinite;
}

@-webkit-keyframes bot-1 {
  0%,
  41% {
    opacity: 0;
  }
  42%,
  100% {
    opacity: 1;
  }
}

@keyframes bot-1 {
  0%,
  41% {
    opacity: 0;
  }
  42%,
  100% {
    opacity: 1;
  }
}
#top-2 {
  -webkit-animation: top-2 var(--duration) infinite;
  animation: top-2 var(--duration) infinite;
}

@-webkit-keyframes top-2 {
  0%,
  42% {
    opacity: 1;
  }
  43%,
  100% {
    opacity: 0;
  }
}

@keyframes top-2 {
  0%,
  42% {
    opacity: 1;
  }
  43%,
  100% {
    opacity: 0;
  }
}
#bot-2 {
  -webkit-animation: bot-2 var(--duration) infinite;
  animation: bot-2 var(--duration) infinite;
}

@-webkit-keyframes bot-2 {
  0%,
  42% {
    opacity: 0;
  }
  43%,
  100% {
    opacity: 1;
  }
}

@keyframes bot-2 {
  0%,
  42% {
    opacity: 0;
  }
  43%,
  100% {
    opacity: 1;
  }
}
#top-3 {
  -webkit-animation: top-3 var(--duration) infinite;
  animation: top-3 var(--duration) infinite;
}

@-webkit-keyframes top-3 {
  0%,
  43% {
    opacity: 1;
  }
  44%,
  100% {
    opacity: 0;
  }
}

@keyframes top-3 {
  0%,
  43% {
    opacity: 1;
  }
  44%,
  100% {
    opacity: 0;
  }
}
#bot-3 {
  -webkit-animation: bot-3 var(--duration) infinite;
  animation: bot-3 var(--duration) infinite;
}

@-webkit-keyframes bot-3 {
  0%,
  43% {
    opacity: 0;
  }
  44%,
  100% {
    opacity: 1;
  }
}

@keyframes bot-3 {
  0%,
  43% {
    opacity: 0;
  }
  44%,
  100% {
    opacity: 1;
  }
}
#top-4 {
  -webkit-animation: top-4 var(--duration) infinite;
  animation: top-4 var(--duration) infinite;
}

@-webkit-keyframes top-4 {
  0%,
  44% {
    opacity: 1;
  }
  45%,
  100% {
    opacity: 0;
  }
}

@keyframes top-4 {
  0%,
  44% {
    opacity: 1;
  }
  45%,
  100% {
    opacity: 0;
  }
}
#bot-4 {
  -webkit-animation: bot-4 var(--duration) infinite;
  animation: bot-4 var(--duration) infinite;
}

@-webkit-keyframes bot-4 {
  0%,
  44% {
    opacity: 0;
  }
  45%,
  100% {
    opacity: 1;
  }
}

@keyframes bot-4 {
  0%,
  44% {
    opacity: 0;
  }
  45%,
  100% {
    opacity: 1;
  }
}
#top-5 {
  -webkit-animation: top-5 var(--duration) infinite;
  animation: top-5 var(--duration) infinite;
}

@-webkit-keyframes top-5 {
  0%,
  45% {
    opacity: 1;
  }
  46%,
  100% {
    opacity: 0;
  }
}

@keyframes top-5 {
  0%,
  45% {
    opacity: 1;
  }
  46%,
  100% {
    opacity: 0;
  }
}
#bot-5 {
  -webkit-animation: bot-5 var(--duration) infinite;
  animation: bot-5 var(--duration) infinite;
}

@-webkit-keyframes bot-5 {
  0%,
  45% {
    opacity: 0;
  }
  46%,
  100% {
    opacity: 1;
  }
}

@keyframes bot-5 {
  0%,
  45% {
    opacity: 0;
  }
  46%,
  100% {
    opacity: 1;
  }
}
#top-6 {
  -webkit-animation: top-6 var(--duration) infinite;
  animation: top-6 var(--duration) infinite;
}

@-webkit-keyframes top-6 {
  0%,
  46% {
    opacity: 1;
  }
  47%,
  100% {
    opacity: 0;
  }
}

@keyframes top-6 {
  0%,
  46% {
    opacity: 1;
  }
  47%,
  100% {
    opacity: 0;
  }
}
#bot-6 {
  -webkit-animation: bot-6 var(--duration) infinite;
  animation: bot-6 var(--duration) infinite;
}

@-webkit-keyframes bot-6 {
  0%,
  46% {
    opacity: 0;
  }
  47%,
  100% {
    opacity: 1;
  }
}

@keyframes bot-6 {
  0%,
  46% {
    opacity: 0;
  }
  47%,
  100% {
    opacity: 1;
  }
}
@-webkit-keyframes spin {
  0%,
  80% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(-180deg);
    transform: rotate(-180deg);
  }
}
@keyframes spin {
  0%,
  80% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(-180deg);
    transform: rotate(-180deg);
  }
}
@-webkit-keyframes shine-color {
  0%,
  80% {
    stroke: #f2f2f2;
  }
  100% {
    stroke: #ccc;
  }
}
@keyframes shine-color {
  0%,
  80% {
    stroke: #f2f2f2;
  }
  100% {
    stroke: #ccc;
  }
}
@-webkit-keyframes shade-color {
  0%,
  80% {
    stroke: #ccc;
  }
  100% {
    stroke: #f2f2f2;
  }
}
@keyframes shade-color {
  0%,
  80% {
    stroke: #ccc;
  }
  100% {
    stroke: #f2f2f2;
  }
}
@-webkit-keyframes mid-1 {
  0%,
  38% {
    opacity: 0;
  }
  39%,
  48% {
    opacity: 1;
  }
  49%,
  100% {
    opacity: 0;
  }
}
@keyframes mid-1 {
  0%,
  38% {
    opacity: 0;
  }
  39%,
  48% {
    opacity: 1;
  }
  49%,
  100% {
    opacity: 0;
  }
}
</style>
