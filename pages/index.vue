<template>
  <div>
    <div class="wrap">
      <div class="mw-canvas">
        <!-- <Display v-if="sections" :sections="sections" /> -->
        {{ this.$store.state.modules.user.id }}
      </div>
    </div>
  </div>
</template>

<script>
import Display from "~/components/Display";

export default {
  name: "index",
  components: { Display }
};
</script>

<style lang="scss" scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
