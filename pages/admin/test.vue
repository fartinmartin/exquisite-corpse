<template>
  <div class="wrap"></div>
</template>

<script>
import Button from "~/components/TODO/Button.vue";
import Gallery from "~/components/TODO/Gallery.vue";
import Input from "~/components/TODO/Input.vue";

export default {
  name: "test",
  middleware: ["password-protect"],
  components: { Button, Gallery, Input, Panel },
};
</script>
