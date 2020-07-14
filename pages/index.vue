<template>
  <div>
    <div class="wrap">
      <div class="mw-canvas">
        <nuxt-link to="/draw">
          <Display v-if="sections" :sections="sections" />
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import Display from "~/components/Display";
import drawings from "~/assets/js/ecc.json";

export default {
  name: "index",
  components: { Display },
  data: function() {
    return {
      sections: {
        top: drawings[2],
        mid: drawings[1],
        bot: drawings[0]
      }
    };
  }
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
