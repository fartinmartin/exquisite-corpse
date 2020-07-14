<template>
  <div>
    <!-- <Log /> -->
    <div class="wrap">
      <div>
        <PickSection v-if="!type" @picked-type="handlePickedType" />
        <Draw v-if="type" :type="type" :sections="sections" />
      </div>
    </div>
  </div>
</template>

<script>
import Log from "~/components/Log";
import Draw from "~/components/Draw";
import PickSection from "~/components/PickSection";
import sections from "~/assets/js/ecc.json";

export default {
  name: "draw",
  data() {
    return {
      type: null,
      sections: {}
    };
  },
  components: { Draw, PickSection, Log },
  methods: {
    handlePickedType(type) {
      this.type = type;

      // set sections that *aren't* type to pull from gallery.sections
      // or for now... pull from drawings aka ecc.json

      this.sections = {
        top: sections[2],
        mid: sections[1],
        bot: sections[0]
      };

      this.sections[type] = { type };
    }
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
