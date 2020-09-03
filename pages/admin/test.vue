<template>
  <div class="wrap">
    <LoadingCursor />
  </div>
</template>

<script>
export default {
  name: "test",
  middleware: ["password-protect"],
};
</script>

<style lang="scss">
.test-test {
  > .content {
    justify-content: stretch;
  }
}
</style>
