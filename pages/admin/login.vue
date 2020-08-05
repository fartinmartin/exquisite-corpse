<template>
  <div class="wrap">
    <div class="border yellow admin mw-canvas">
      <div class="input-wrap">
        <input
          v-model="password"
          type="password"
          placeholder="password"
          ref="pwInput"
        />
        <button class="button" @click.prevent="logIn">
          log in
        </button>
      </div>
    </div>
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
  padding: 1rem;
  &:not(:first-child) {
    margin-top: 2rem;
  }
}

.input-wrap {
  display: flex;

  > * {
    width: 50%;
  }

  &:not(:first-child) {
    margin-top: 1rem;
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
