<template>
  <div class="wrap">
    <Panel>Hello</Panel>
    <Panel color="red" class="mt mb" />
    <Panel color="blue" width="60px" no-padding />
    <Panel color="green" class="mt" min-height="initial" />
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
