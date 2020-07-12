<template>
  <div>
    <div class="wrap">
      <div class="mw-canvas">
        <Display
          style="margin-top: calc(40px / 3)"
          :sections="{
            top: section1,
            mid: section2,
            bot: section3
          }"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Display from "~/components/Display";
import section1 from "~/assets/js/drawing1.json";
import section2 from "~/assets/js/drawing2.json";
import section3 from "~/assets/js/drawing3.json";

export default {
  name: "index",
  data() {
    return {
      section1,
      section2,
      section3
    };
  },
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
