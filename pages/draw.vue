<template>
  <div class="wrap">
    <Log />
    <PickSection v-if="!type" @picked-type="handlePickedType" />
    <Draw v-if="type" :type="type" :sections="sections" />
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
      this.$store.dispatch("modules/drawing/setType", type);

      // set sections that *aren't* same type to pull from gallery.sections
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
