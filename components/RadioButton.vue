<template>
  <div class="radio-wrap" :class="{ active: active === value }">
    <input
      type="radio"
      :id="value"
      :name="group"
      :value="value"
      @click="$emit('selected', value)"
    />
    <label :for="value">
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  name: "RadioButton",
  model: {
    prop: "active",
    event: "selected"
  },
  props: {
    value: { type: String, required: true },
    active: { required: true },
    group: String,
    tooltip: String
  }
};
</script>

<style lang="scss" scoped>
input {
  display: none;
}

.radio-wrap.active .icon {
  border: 2px solid var(--light-blue);
  border-top: 2px solid var(--lighter-blue);
  border-left: 2px solid var(--lighter-blue);
}

.radio-wrap:not(.active) {
  filter: grayscale(1);
  opacity: 0.6;
}
</style>
