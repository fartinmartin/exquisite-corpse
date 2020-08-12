<template>
  <div class="wrap">
    <Panel class="admin">
      <Input
        id="admin-password"
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
export default {
  name: "login",

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
        this.$store.dispatch("setIsAdmin", true);
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
