<template>
  <div class="wrap">
    <Panel class="admin">
      <input
        v-model="password"
        type="password"
        placeholder="password"
        ref="pwInput"
      />
      <button class="button" @click.prevent="logIn">
        log in
      </button>
    </Panel>
  </div>
</template>

<script>
import Panel from "~/components/Panel.vue";

export default {
  name: "login",
  components: { Panel },
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
        this.$refs.pwInput.placeholder = "sry, wrong";
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

input {
  position: relative;
  width: 100%;
  padding: 0.5rem 0;

  font-size: inherit;
  font-family: inherit;

  border: none;
  border-radius: 0;
  background: none;

  border-bottom: 1px dotted var(--orange);
}

::placeholder,
input.temp {
  color: #7f7f7f;
  opacity: 1;
}
</style>
