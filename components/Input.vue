<template>
  <div class="input-wrap">
    <label :for="id" v-if="label">
      {{ label }}
      <span class="note" v-if="note">{{ note }}</span>
    </label>
    <input
      type="text"
      :id="id"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :value="value"
      @input="handleInput"
      @focus="handleFocus"
      ref="inputRef"
    />
  </div>
</template>

<script>
export default {
  name: "Input",
  props: {
    value: { type: String },
    id: { type: String, required: true },
    label: { type: String },
    placeholder: { type: String },
    maxlength: { type: Number },
    note: { type: String },
  },
  methods: {
    handleInput(e) {
      this.$emit("input", e.target.value);
    },
    handleFocus() {
      this.$emit("focus");
    },
  },
};
</script>

<style lang="scss" scoped>
.input-wrap {
  display: flex;
  width: 100%;
}

label,
input {
  position: relative;
  width: 100%;
  padding: 0.5rem 0;
  border-bottom: 1px dotted var(--orange);
}

label {
  @media screen and (max-width: 544px) {
    width: 25%;
    padding-right: 1rem;
  }
}

::placeholder,
.temp input {
  color: #7f7f7f;
  opacity: 1;
}

.note {
  width: 100%;
  display: block;

  position: absolute;
  right: 0;
  bottom: 0;
  transform: translate3d(100%, 100%, 0);

  font-size: 10px;
  text-align: center;

  @media screen and (max-width: 544px) {
    transform: translate3d(calc(100% - 4rem), 100%, 0);
    width: 400%;
  }
}
</style>
