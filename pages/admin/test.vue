<template>
  <div class="wrap">
    <Input id="test" label="this is a test:" placeholder="noice" />
    <Panel class="mt test-test">
      <Input id="test2" placeholder="no label noice" />
      <Button>test</Button>
    </Panel>
    <Panel class="mt test-test">
      <Input
        id="panel"
        label="this b test:"
        note="@s will link to ur gram"
        placeholder="noice"
      />
      <Button color="yellow" text="farts" />
    </Panel>
  </div>
</template>

<script>
import Panel from "~/components/Panel.vue";
import Button from "~/components/Button.vue";
import Gallery from "~/components/TODO/Gallery.vue";
import Input from "~/components/Input.vue";

export default {
  name: "test",
  middleware: ["password-protect"],
  components: { Panel, Button, Gallery, Input },
};
</script>

<style lang="scss">
.test-test {
  > .content {
    justify-content: stretch;
  }
}
</style>
