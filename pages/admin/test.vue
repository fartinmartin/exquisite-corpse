<template>
  <div class="wrap">
    <Panel>Hello</Panel>
    <Panel color="red" class="mt mb" />
    <Panel color="blue" no-padding />
    <Panel color="blue" interactive no-padding />
    <Panel color="green" class="mt" />
  </div>
</template>

<script>
import Button from "~/components/TODO/Button.vue";
// import Filter from "~/components/TODO/Filter.vue";
import Gallery from "~/components/TODO/Gallery.vue";
import Input from "~/components/TODO/Input.vue";
import Panel from "~/components/Panel.vue";

export default {
  name: "test",
  middleware: ["password-protect"],
  components: { Button, Gallery, Input, Panel },
};
</script>
