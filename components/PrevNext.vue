<template>
  <div class="prev-next">
    <div class="prev border yellow"><div class="icon interactive">👈</div></div>
    <div class="next border yellow"><div class="icon interactive">👉</div></div>
  </div>
</template>

<script>
export default {
  name: "PrevNext"
};
</script>

<style lang="scss" scoped>
.prev,
.next {
  width: 60px;
  height: 60px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  z-index: 100;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.prev {
  left: calc(40px / 3);
}

.next {
  right: calc(40px / 3);
}
</style>
