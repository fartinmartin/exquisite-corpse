<template>
  <div class="wrap">
    <Panel />
    <Panel color="red" />
    <Panel no-padding />
  </div>
</template>

<script>
import Button from "~/components/TODO/Button.vue";
// import Filter from "~/components/TODO/Filter.vue";
import Gallery from "~/components/TODO/Gallery.vue";
import Input from "~/components/TODO/Input.vue";
import Panel from "~/components/TODO/Panel.vue";

export default {
  name: "test",
  components: { Button, Gallery, Input, Panel },
};
</script>
