<template>
  <div class="wrap">
    <Panel class="admin">
      <Input
        v-model="password"
        type="password"
        placeholder="password"
        ref="pwInput"
      />
      <Button @click="logIn" text="log in" />
    </Panel>
  </div>
</template>

<script>
import Panel from "~/components/Panel.vue";
import Input from "~/components/Input.vue";
import Button from "~/components/Button.vue";

export default {
  name: "login",
  components: { Panel, Input, Button },
  data: () => ({ password: "", isAuthorised: false }),
  mounted() {
    this.isAuthorised = this.$passwordProtect.isAuthorised();
  },
  methods: {
    logIn() {
      this.$passwordProtect.authorise(this.password);
      this.isAuthorised = this.$passwordProtect.isAuthorised();
      if (this.isAuthorised) {
        this.$router.push("/admin");
      } else {
        this.password = "";
        this.$refs.pwInput.$refs.inputRef.placeholder = "sry, wrong";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.admin {
  > .content {
    justify-content: stretch;
  }
}
</style>
