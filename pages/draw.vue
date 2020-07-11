<template>
  <div>
    <Log />
    <div class="wrap">
      <div>
        <Alert />
        <Draw
          :sections="{
            top: section1,
            mid: null,
            bot: section2
          }"
        />
      </div>
    </div>
    <CustomCursor />
  </div>
</template>

<script>
import Alert from "~/components/Alert";
import Log from "~/components/Log";
import Draw from "~/components/Draw";
import CustomCursor from "~/components/CustomCursor";
import section1 from "~/assets/js/drawing1.json";
import section2 from "~/assets/js/drawing2.json";

export default {
  name: "draw",
  data() {
    return {
      section1,
      section2
    };
  },
  components: { CustomCursor, Draw, Alert, Log }
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
