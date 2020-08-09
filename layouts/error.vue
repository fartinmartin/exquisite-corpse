<template>
  <div class="container">
    <Panel color="red" class="error-msg">
      <h1 class="mb">
        oop,
        <span v-if="error.statusCode === 404">this page does not exist!</span>
        <span v-else>an error occurred!</span>
      </h1>
      <span>best head back <nuxt-link to="/">home</nuxt-link></span>
    </Panel>
  </div>
</template>

<script>
import Panel from "~/components/Panel.vue";

export default {
  props: ["error"],
  components: { Panel },
};
</script>

<style lang="scss">
.error-msg {
  > .content {
    flex-direction: column;
  }

  a {
    text-decoration: underline;
    color: var(--blue);
  }
}
</style>
