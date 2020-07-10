<template>
  <div class="wrap">
    <div>
      <Alert />
      <ExquisiteCorpse />
    </div>
  </div>
</template>

<script>
import Alert from "~/components/Alert";
import ExquisiteCorpse from "~/components/ExquisiteCorpse";
export default {
  name: "index",
  components: { ExquisiteCorpse, Alert }
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
