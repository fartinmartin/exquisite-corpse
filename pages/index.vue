<template>
  <div>
    <div class="wrap">
      <div>
        <Alert />
        <div class="two-by-one">
          <About />
          <Display
            :sections="{
              top: section1,
              mid: section2,
              bot: section3
            }"
          />
        </div>
      </div>
    </div>
    <CustomCursor />
  </div>
</template>

<script>
import About from "~/components/About";
import Alert from "~/components/Alert";
import Display from "~/components/Display";
import CustomCursor from "~/components/CustomCursor";
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
  components: { CustomCursor, About, Display, Alert }
};
</script>

<style lang="scss" scoped>
.wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.two-by-one {
  display: grid;
  grid-template-columns: repeat(2, 544px);
  gap: 40px;
}
</style>
