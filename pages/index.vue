<template>
  <div class="wrap">
    <div>
      <CustomCursor />
      <Alert />
      <ExquisiteCorpse />
    </div>
  </div>
</template>

<script>
import Alert from "~/components/Alert";
import ExquisiteCorpse from "~/components/ExquisiteCorpse";
import CustomCursor from "~/components/CustomCursor";
export default {
  name: "index",
  components: { CustomCursor, ExquisiteCorpse, Alert }
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
