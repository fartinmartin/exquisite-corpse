<template>
  <div class="icon" :class="{ interactive, 'look-at-me': shimmer }">
    <img v-if="svg" :src="require(`~/assets/img/${svg}.svg`)" />
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    svg: { type: String },
    interactive: { type: Boolean, default: true },
    shimmer: { type: Boolean, default: false }
  }
};
</script>

<style lang="scss" scoped>
.icon {
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 25px;
  height: 25px;

  box-sizing: content-box;
  border: 2px solid transparent;

  &.interactive:active {
    border: 2px solid var(--lighter-yellow);
    border-top: 2px solid var(--yellow);
    border-left: 2px solid var(--yellow);
    transform: translate3d(2px, 2px, 0);
  }

  * {
    pointer-events: none;
  }
}

.look-at-me {
  position: relative;
  overflow: hidden;

  &::before,
  &:after {
    content: "";
    position: absolute;
    top: 25%;
    left: 50%;
    height: 100%;
    transform: rotate(45deg) translateX(-30px);
    background: rgba(255, 255, 255, 0.45);
    mix-blend-mode: screen;
    pointer-events: none;

    animation: diagonal-shimmer 2.5s infinite ease-in-out;
  }
  &::before {
    width: 4px;
    animation-delay: calc(var(--animation-delay) + 0.25s);
    background: rgba(255, 255, 255, 0.25);
  }
  &::after {
    width: 10px;
    animation-delay: calc(var(--animation-delay));
  }

  @for $i from 1 through 50 {
    &:nth-child(#{$i}) {
      --animation-delay: 250ms * #{$i};
    }
  }
}

@keyframes diagonal-shimmer {
  0% {
    transform: rotate(45deg) translateX(-30px);
  }
  50% {
    transform: rotate(50deg) translateX(10px);
  }
  100% {
    transform: rotate(50deg) translateX(10px);
  }
}
</style>
