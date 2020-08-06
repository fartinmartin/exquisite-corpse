<template>
  <Panel color="blue" interactive no-padding>
    <img :src="drawing.thumb" />
  </Panel>
</template>

<script>
import Panel from "~/components/Panel.vue";

export default {
  name: "Drawing",
  components: { Panel },
  props: { drawing: Object },
};
</script>
